# Big-Data-Infrastructure

This project is implemented for the course Big Data in the Coperative State University Baden-Württemberg Mannheim

## Team members

:bust_in_silhouette: Michael Greif - 

:bust_in_silhouette: German Paul - 9973152

:bust_in_silhouette: Lukas Moosmann - 3805562

:bust_in_silhouette: Nico Dobberkau - 


## Tech stack

![Worklfow Manager](https://img.shields.io/badge/workflow%20manager%20for%20containerized%20development-D6EFD8?style=for-the-badge) [![Skaffold](https://img.shields.io/badge/skaffold-white?style=for-the-badge&logo=skaffold)](https://skaffold.dev/)

![Manager of Workloads and Services](https://img.shields.io/badge/manager%20of%20containerized%20workloads%20and%20services-80AF81?style=for-the-badge) ![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

![Containerization](https://img.shields.io/badge/containerization-D6EFD8?style=for-the-badge) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

![Backend](https://img.shields.io/badge/backend-80AF81?style=for-the-badge) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

![Frontend](https://img.shields.io/badge/frontend-D6EFD8?style=for-the-badge) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

![Database](https://img.shields.io/badge/database-80AF81?style=for-the-badge) ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)

![Model](https://img.shields.io/badge/model-D6EFD8?style=for-the-badge) ![Apache Spark](https://img.shields.io/badge/Apache%20Spark-FDEE21?style=for-the-badge&logo=apachespark&logoColor=black)

![Event Streaming](https://img.shields.io/badge/distributed%20event%20streaming%20platform-80AF81?style=for-the-badge) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)

## Folder structure

```
📦root directory
 ┣ 📂Express-React-web-app
 ┃ ┣ 📂client
 ┃ ┃ ┣ 📜Dockerfile for the Frontend
 ┃ ┃ ┣ 📜React Frontend
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
 ┣ 📜README
 ┣ 📜files to be ignored by git
 ┗ 📜skaffold initializer
```

## Setup

### Prerequisite
You need to have kafka in your kubernetes (Minikube).\n
Please have atleast 4 CPUs and 5000 MB Memory for Kafka to work without issues

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

### How to run locally without Minikube

1. start webserver
```bash
cd Express-React-web-app
cd server
npm i
npm run dev
```
2. start backend
```bash
cd Express-React-web-app
cd client
npm i
npm start
```

3. start kafka-container
```bash
cd Kafka-container
docker-compose up -d
```

4. start pyspark
```bash
cd Pyspark
docker build -t spark_test .
docker run -it --rm --net=host spark_test
```

### How to run with minikube

1. You need the kafka Cluster in your minikube see #Prerequisite

2. Run Skaffold and build the project
```bash
skaffold dev
```

3. Get our Webapp via Tunneling
```bash
minikube service client-service
```

### How to show kafka DataStream
If Kafka is running, enter the current container and listen to the data-input-stream.
```bash
docker exec -it <container-id> bash

/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic movie_events --from-beginning
```

## Demo

[![Big Data Demo](https://markdown-videos-api.jorgenkh.no/url?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DVtYL33UXvco)](https://www.youtube.com/watch?v=VtYL33UXvco)

## Implementation and Functionality

Description of how the system works

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