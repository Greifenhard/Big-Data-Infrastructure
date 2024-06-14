const { Kafka, Partitioners  } = require('kafkajs')
const express = require('express')
const app = express()

const UserId = Math.round(Math.random()*1000000000)%200000+1 // user has specific userId, that changes whenever he starts the application

app.get("/api", (req, res) => {
    res.json({"users": ["UserOne", "UserTwo","UserThree"]})
})

app.get("/movies/:movieId/:rating", (req, res) => {
    let movieId = req.params['movieId']
    let rating = req.params['rating']
    
    res.json({"id":[movieId]})
    
    sendTrackingMessage({
        userId:Number(UserId),
        movieId:Number(movieId),
        rating:Number(rating),
        timestamp: Math.floor(new Date() / 1000)
    }).then(() => console.log(`Sent movieId=${movieId} with rating=${rating} to kafka topic=nextjs-events`))
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
