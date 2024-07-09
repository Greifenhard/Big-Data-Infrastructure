from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StructType, TimestampType

from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Create a spark session
spark = SparkSession.builder \
    .appName("Movie Recommender") \
    .getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('WARN')

# Read messages from Kafka
kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "movie-events") \
    .option("startingOffsets", "earliest") \
    .load()

# Define schema of tracking data
trackingMessageSchema = StructType() \
    .add("userId", IntegerType()) \
    .add("movieId", IntegerType()) \
    .add("rating", IntegerType()) \
    .add("timestamp", IntegerType())

# Convert value: binary -> JSON -> fields + parsed timestamp
trackingMessages = kafkaMessages.select(
    from_json(
        column("value").cast("string"),
        trackingMessageSchema
    ).alias("json")
).select(
    # Convert Unix timestamp to TimestampType
    from_unixtime(column('json.timestamp'))
    .cast(TimestampType())
    .alias("parsed_timestamp"),

    # Select all JSON fields
    column("json.*")
).withWatermark("parsed_timestamp", windowDuration) \
  .withColumnRenamed('userId', 'UserID') \
  .withColumnRenamed('movieId', 'MovieID') \
  .withColumnRenamed('rating', 'Rating')

# Compute most popular movies
popular_new = trackingMessages.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("MovieID")
).count() \
 .withColumnRenamed('window.start', 'window_start') \
 .withColumnRenamed('window.end', 'window_end')

# Load historical data for ALS model
data = spark.read.csv("MovieLens-1Mil-Dataset/ratings.dat", sep="::", schema='UserID int, MovieID int, Rating int, Timestamp long')

als = ALS(maxIter=5, 
          regParam=0.01, 
          implicitPrefs=True,
          userCol="UserID", 
          itemCol="MovieID", 
          ratingCol="Rating")
model = als.fit(data)

# Generate recommendations
recommendations = model.transform(trackingMessages)

# Load movies dataset
movies = spark.read.csv("MovieLens-1Mil-Dataset/movies.dat", sep="::", schema='MovieID int, MovieTitle string, Genre string')

# Join recommendations with movies
recommended_movies = recommendations.join(movies, on="MovieID")
popular = popular_new.join(movies, on="MovieID")

watched_movies = trackingMessages.join(movies, on="MovieID")

# Aggregate and sort recommendations
top_results = recommended_movies.groupBy("MovieID", "MovieTitle", "Genre").agg(
    avg("Rating").alias("avg_prediction")
).orderBy("avg_prediction", ascending=False)

# consoleDump = popular \
#     .writeStream \
#     .outputMode("update") \
#     .format("console") \
#     .start()

# consoleDump2 = top_results \
#     .writeStream \
#     .outputMode("complete") \
#     .format("console") \
#     .start()

# consoleDump3 = watched_movies \
#     .writeStream \
#     .outputMode("update") \
#     .format("console") \
#     .start()

dbUrl = "jdbc:mysql://mariadb-service:3306/movies"
dbOptions = {"user": "root", "password": "mysecretpw"}

def saveToDatabaseCounter(batchDataframe, batchId):
    global dbUrl, dbOptions
    print(f"Writing batchID {batchId} to database @ {dbUrl}/popular")
    batchDataframe.write.jdbc(dbUrl, 'popular', "overwrite", dbOptions)

def saveToDatabasePrediction(batchDataframe, batchId):
    global dbUrl, dbOptions
    print(f"Writing batchID {batchId} to database @ {dbUrl}/prediction")
    batchDataframe.write.jdbc(dbUrl, "prediction", "overwrite", dbOptions)

dbInsertStream = popular \
    .select(column('MovieID'), column('MovieTitle'), column('count')) \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabaseCounter) \
    .start()

dbInsertStream = top_results \
    .select(column('MovieID'), column('MovieTitle'), column('avg_prediction')) \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabasePrediction) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()
