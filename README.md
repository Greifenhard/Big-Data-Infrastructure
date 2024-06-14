# Big-Data-Infrastructure
## How to run

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


## How to show kafka DataStream
If Kafka is running, enter the current container and listen to the data-input-stream.
```bash
docker exec -it <container-id> bash

/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic nextjs-events --from-beginning
```


