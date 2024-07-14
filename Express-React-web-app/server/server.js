const { Kafka, Partitioners  } = require('kafkajs')
const mariadb = require('mariadb')
const express = require('express')
const app = express()

const UserId = (Math.random()*1000000000).toFixed(0) // user has specific userId, that changes whenever he starts the application

app.get("/popular", (req, res) => {
    const topX = 5;
    getPopular(topX).then(values => {
        const convertedValues = values.map(value => ({
            id: value.id,
            title: value.title,
            count: Number(value.count)
        }));
        console.log(convertedValues)
        res.send({"movies": convertedValues})
    })
});

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

// -------------------------------------------------------
// Kafka Configuration
// -------------------------------------------------------

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

// -------------------------------------------------------
// Database Configuration
// -------------------------------------------------------

// Creating Poolobject to connect to Database
const pool = mariadb.createPool({
    host: "mariadb-service",
    port: 3306,
    database: "movies",
    user: "root",
    password: "mysecretpw",
    connectionLimit: 5
})

// Get Data from Database with SQL
async function executeQuery(query, data) {
	let connection
	try {
		connection = await pool.getConnection()
		console.log("Executing query ", query)
		let res = await connection.query({ rowsAsArray: true, sql: query }, data)
		return res
	} finally {
		if (connection)
			connection.end()
	}
}

// Get popular movies (from db only)
async function getPopular(maxCount) {
	const query = "SELECT MovieID, MovieTitle, SUM(count) FROM popular GROUP BY MovieID ORDER BY SUM(count) DESC LIMIT ?"
	return (await executeQuery(query, [maxCount]))
		.map(row => ({ id: row?.[0], title: row?.[1] ,count: row?.[2] }))
}

// Get best rated movies (from db only)
async function getAvgRating(maxCount) {
	const query = "SELECT * FROM rating ORDER BY avg_rating DESC LIMIT ?";
	return (await executeQuery(query, [maxCount]))
		.map(row => ({ id: row?.[0], title: row?.[1] , score: row?.[2] }))
}


app.listen(5001, () => {
    console.log("Server started on Port 5001")
})
