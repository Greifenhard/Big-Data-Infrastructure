# Big-Data-Infrastructure

This project is implemented for the course Big Data in the Coperative State University Baden-Württemberg Mannheim

## Team members

👤 Michael Greif - 5658606

👤 German Paul - 9973152

👤 Lukas Moosmann - 3805562

👤 Nico Dobberkau - 

## Tech stack

![alt text](./ReadMe%20images/techstack.svg)

![Worklfow Manager](https://img.shields.io/badge/workflow%20manager%20for%20containerized%20development-D6EFD8?style=for-the-badge) [![Skaffold](https://img.shields.io/badge/skaffold-white?style=for-the-badge&logo=skaffold)](https://skaffold.dev/)

![Manager of Workloads and Services](https://img.shields.io/badge/manager%20of%20containerized%20workloads%20and%20services-80AF81?style=for-the-badge) ![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

![Containerization](https://img.shields.io/badge/containerization-D6EFD8?style=for-the-badge) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

![Backend](https://img.shields.io/badge/backend-80AF81?style=for-the-badge) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

![Frontend](https://img.shields.io/badge/frontend-D6EFD8?style=for-the-badge) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

![Database](https://img.shields.io/badge/database-80AF81?style=for-the-badge) ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)

![Model](https://img.shields.io/badge/model-D6EFD8?style=for-the-badge) ![Apache Spark](https://img.shields.io/badge/Apache%20Spark-FDEE21?style=for-the-badge&logo=apachespark&logoColor=black)

![Event Streaming](https://img.shields.io/badge/distributed%20event%20streaming%20platform-80AF81?style=for-the-badge) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)

## Folder structure

```bash
📦root directory
 ┣ 📂Express-React-web-app
 ┃ ┣ 📂client
 ┃ ┃ ┣ 📜Dockerfile for the Frontend
 ┃ ┃ ┣ 📂src
 ┃ ┃ ┃ ┣ 📜 React Frontend
 ┃ ┣ 📂server
 ┃ ┃ ┣ 📜Dockerfile for the server (backend)
 ┃ ┃ ┣ 📜All backend functionality inside server.js
 ┣ 📂k8s
 ┃ ┣ 📜Port service for the frontend application to run on local machine
 ┃ ┣ 📜Kafka initialization
 ┃ ┣ 📜Mariadb creation
 ┃ ┣ 📜Pyspark deployment
 ┃ ┣ 📜Server initialization
 ┣ 📂PySpark
 ┃ ┣ 📂ml-25m
 ┃ ┃ ┣ 📜Movie Dataset
 ┃ ┣ 📜Dockerfile for model creation
 ┃ ┣ 📜PySpark Model
 ┣ 📂ReadMe images
 ┣ 📜README
 ┣ 📜files to be ignored by git
 ┗ 📜skaffold initializer
```

## Setup

### Prerequisite

You need to have kafka in your kubernetes (Minikube).
Please have atleast 2 CPUs and 5000 MB Memory for Kafka to work without issues in minikube.

1. Run the strimzi operator

```bash
# Add helm repository
helm repo add strimzi http://strimzi.io/charts/
helm repo update

# Install Strimzi Operator
helm status my-kafka-operator 2>&1 >>/dev/null 2>&1 || \
    helm install my-kafka-operator strimzi/strimzi-kafka-operator
```

2. Deploy the cluster

```bash
kubectl apply -f https://raw.githubusercontent.com/strimzi/strimzi-kafka-operator/0.41.0/examples/kafka/kafka-ephemeral-single.yaml
```

### How to run with minikube

1. You need the kafka Cluster in your minikube see [Prerequesite](#prerequisite)
2. Run Skaffold and build the project

```bash
skaffold dev
```

3. Get our Webapp via Tunneling

```bash
minikube service client-service
```

## Demo

[![Big Data Demo](https://markdown-videos-api.jorgenkh.no/url?url=https%3A%2F%2Fyoutu.be%2FL6LOPi84rG8)](https://youtu.be/L6LOPi84rG8)

## Implementation and Functionality

### Overview

This project is based on the general structure of a Kappa architecture in the big data engineering context, whereby this application specializes in the search and rating of films. The user can select a movie in the movie search and gets a short information about its genre, as well as the possibility to rate it from 0 - 5 stars. If the user rates one movie, this data is loaded in real time from the React frontend to the Node backend server and stored from there in Kafka with a timestamp. From this data ingestion layer, the existing data is now evaluated in the processing layer with batch processing from Apache Spark (Pyspark). This evaluation calculates the number of views that a movie has generated as well as the current user rating, which is calculated on the basis of all user ratings. These results are stored in a MariaDB as a serving layer and fed back to the node backend so that they can be sorted and displayed in the application. All parts are containerized with Docker and deployed by skaffold in a minikube cluster.

### Data Ingestion Layer

The data ingestion layer comprises the components of the frontend (React), the backend (Node + Express) and a Kafka cluster from Strimzi. If a movie is rated by the user, the information "MovieID" and "Rating" is forwarded to the backend via an Express API in the URL and processed there. Here, the current "UserID" and a timestamp are also written to the "movie-events" kafkatopic in Json format. Upon successful execution, a corresponding console output is displayed.

```javascript
app.get("/movies/:movieId/:rating", (req, res) => {
    let movieId = req.params['movieId']
    let rating = req.params['rating']
  
    sendTrackingMessage({
        userId:Number(UserId),
        movieId:Number(movieId),
        rating:Number(rating),
        timestamp: Math.floor(new Date() / 1000)
    }).then(() => console.log(`Sent movieId=${movieId} with rating=${rating} from user=${UserId} to kafka topic=movie-events`))
        .catch(e => console.log("Error sending to kafka", e))

});
```

The kafka connection is established through Javascript Library "KafkaJs".

```javascript
const kafka = new Kafka({
    clientId: UserId,
    brokers: ["my-cluster-kafka-bootstrap:9092"],
})

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })

async function sendTrackingMessage(data) {
    await producer.connect();
    await producer.send({
        topic: 'movie-events',
        messages: [
            { value: JSON.stringify(data) }
        ],
    });
    await producer.disconnect();
}
```

### Processing Layer

Batches are used to process the Kafka stream, the data of which is used in Pyspark to count the number of movies watched and to calculate the average rating for each movie. These results are written with JDBC to our datastorage, which is provided via a MariaDB in the Kubernetes cluster.

```python-repl
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
```

### Serving Layer

The stored data from MariaDB can now be retrieved from the node backend using SQL queries and finally sent back to the React frontend via the Express API.

```javascript
app.get("/avgrating", (req, res) => {
    const topX = 5;
    getAvgRating(topX).then(values => {
        const convertedValues = values.map(value => ({
            id: value.id,
            title: value.title,
            score: Number(value.score)
        }));
        console.log(convertedValues)
        res.send({"prediction": convertedValues})
    })
});

// Get best rated movies (from db only)
async function getAvgRating(maxCount) {
	const query = "SELECT * FROM rating ORDER BY avg_rating DESC LIMIT ?";
	return (await executeQuery(query, [maxCount]))
		.map(row => ({ id: row?.[0], title: row?.[1] , score: row?.[2] }))
}
```

## Achievments, Obstacles and Outlook

The successful integration of multiple components into a cohesive system represents a significant achievement in this project. While individual components were not inherently complex, their combination into a unified, functional system presented considerable challenges.

**Key Challenges:**

- Cross-platform Compatibility: Initial difficulties arose from inconsistent performance across different machines, including variations in the original project provided by Professor Dennis Pfisterer.
- Containerization: The implementation of container technology was crucial in resolving cross-platform issues, highlighting the importance of consistent development environments.
- Component Integration: Early development phases focused on individual components without sufficient consideration for system-wide integration. This necessitated redesigns, particularly in the user interface, to ensure compatibility with other system elements.

**Lessons Learned:**

- The importance of a holistic approach in system design, considering the interoperability of all components from the outset.
- The value of containerization in ensuring consistent performance across different environments.
- The need for flexibility and adaptability in the development process, allowing for necessary adjustments as the project evolves.

**Conclusion:**

Despite the challenges encountered, the project yielded valuable insights into complex system integration. The successful completion of the project demonstrates the team's ability to overcome technical obstacles and adapt to evolving requirements. This revised version presents the information in a more structured, objective, and formal manner, which is more appropriate for scientific or technical writing.
