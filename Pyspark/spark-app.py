from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StructType, TimestampType

from pyspark.ml.recommendation import ALS

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Create a spark session
spark = SparkSession.builder \
    .appName("Datawhispers Movierater") \
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

# Load movies dataset
movies = spark.read.csv("ml-25m/movies.csv", sep=",", schema='MovieID int, MovieTitle string, Genre string')

# Join Tables with Movies on MovieID
AverageRating = trackingMessages.join(movies, on="MovieID")
popular = popular.join(movies, on="MovieID")

# Aggregate and sort Average Ratings
top_results = AverageRating.groupBy("MovieID", "MovieTitle", "Genre").agg(
    avg("Rating").alias("avg_rating")
).orderBy("avg_rating", ascending=False)

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

dbUrl = "jdbc:mysql://mariadb-service:3306/movies"
dbOptions = {"user": "root", "password": "mysecretpw"}

def saveToDatabaseCounter(batchDataframe, batchId):
    global dbUrl, dbOptions
    print(f"Writing batchID {batchId} to database @ {dbUrl}/popular")
    batchDataframe.write.jdbc(dbUrl, 'popular', "overwrite", dbOptions)

def saveToDatabaseRating(batchDataframe, batchId):
    global dbUrl, dbOptions
    print(f"Writing batchID {batchId} to database @ {dbUrl}/rating")
    batchDataframe.write.jdbc(dbUrl, "rating", "overwrite", dbOptions)

dbInsertStream = popular \
    .select(column('MovieID'), column('MovieTitle'), column('count')) \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabaseCounter) \
    .start()

dbInsertStream = top_results \
    .select(column('MovieID'), column('MovieTitle'), column('avg_rating')) \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabaseRating) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()
