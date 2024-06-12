const { Kafka, Partitioners  } = require('kafkajs')
const express = require('express')
const app = express()

app.get("/api", (req, res) => {
    res.json({"users": ["UserOne", "UserTwo","UserThree"]})
})

app.get("/movies/:movieId", (req, res) => {
    let movieId = req.params['movieId']
    res.json({"id":[movieId]})

    sendTrackingMessage({
        movieId:Number(movieId), 
        timestamp: Math.floor(new Date() / 1000)
    }).then(() => console.log(`Sent movieId=${movieId} to kafka topic=nextjs-events`))
        .catch(e => console.log("Error sending to kafka", e))

});


// Create the client with the broker list
const kafka = new Kafka({
    clientId: 'seflbiadsf',
    brokers: ['localhost:9092'],
  })

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })

async function sendTrackingMessage(data) {
    await producer.connect();
    await producer.send({
        topic: 'nextjs-events',
        messages: [
            { value: JSON.stringify(data) }
        ],
    });
    await producer.disconnect();
}

app.listen(5000, () => {
    console.log("Server started on Port 5000")
})
