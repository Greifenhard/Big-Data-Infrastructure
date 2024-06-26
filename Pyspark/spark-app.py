from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StructType, TimestampType

from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator

dbUrl = 'jdbc:mysql://mariadb-service:3306/movies'
dbOptions = {"user": "root", "password": "mysecretpw"}
dbSchema = 'popular'

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Example Part 1
# Create a spark session
spark = SparkSession.builder \
    .appName("Movie Recommender") \
    .getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('WARN')

# Example Part 2
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

# Example Part 3
# Convert value: binary -> JSON -> fields + parsed timestamp
trackingMessages = kafkaMessages.select(
    # Extract 'value' from Kafka message (i.e., the tracking data)
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

# Example Part 4
# Compute most popular slides
popular = trackingMessages.groupBy(
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

watched_movies = trackingMessages.join(movies, on="MovieID")

# Aggregate and sort recommendations
top_results = recommended_movies.groupBy("MovieID", "MovieTitle", "Genre").agg(
    avg("Rating").alias("avg_prediction")
).orderBy("avg_prediction", ascending=False)

# Example Part 5
# Start running the query; print running counts to the console
consoleDump = popular \
    .writeStream \
    .outputMode("update") \
    .format("console") \
    .start()

consoleDump2 = top_results \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

consoleDump3 = watched_movies \
    .writeStream \
    .outputMode("update") \
    .format("console") \
    .start()

def saveToDatabase(batchDataframe, batchId):
    global dbUrl, dbSchema, dbOptions
    print(f"Writing batchID {batchId} to database @ {dbUrl}")
    batchDataframe.distinct().write.jdbc(dbUrl, dbSchema, "overwrite", dbOptions)


dbInsertStream = popular \
    .select(column('MovieID'), column('count')) \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabase) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()