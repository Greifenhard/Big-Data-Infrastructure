# Big-Data-Infrastructure

## Prerequisite
You need to have kafka in your kubernetes

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

## How to run locally without Minikube

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

## How to run with minikube

1. You need the kafka Cluster in your minikube see #Prerequisite

2. Run Skaffold and build the project
```bash
skaffold dev
```

3. Get our Webapp via Tunneling
```bash
minikube service client-service
```

## How to show kafka DataStream
If Kafka is running, enter the current container and listen to the data-input-stream.
```bash
docker exec -it <container-id> bash

/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic movie_events --from-beginning
```


