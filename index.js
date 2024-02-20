var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var cors = require('cors');

require('dotenv').config();

var app = express();
app.use(express.json());
app.use(cors());

var CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
var DATABASENAME = 'kanban'
var database

app.listen(3002, () => {
    MongoClient.connect(CONNECTION_STRING)
        .then((client) => {
            database = client.db(DATABASENAME);
            console.log("CONECTADO COM SUCESSO (:");
        })
        .catch((error) => {
            console.error("Error connecting to MongoDB:", error);
        });
})


// Get all tasks
app.get('/api/kanban/getalltasks', (request, response) => {
    database.collection('kanban-tasks').find({}).toArray((error, result) => {
        response.send(result)
    })
})

let currentId = 1; // Initialize with the starting ID

app.post('/api/kanban/posttask', express.json(), (request, response) => {
    const newTask = {
        id: currentId.toString(), // Use the current ID and then increment it
        title: request.body.title,
        completed: request.body.completed,
        doing: request.body.doing,
        completionDate: request.body.completionDate
    };

    currentId++; // Increment the ID for the next task

    database.collection('kanban-tasks').insertOne(newTask, (error, result) => {
        if (error) {
            console.error("Error adding new task:", error);
            response.status(500).json("Error adding new task");
        } else {
            response.json({
                id: newTask.id, // Send back the generated ID
                message: 'Adicionada nova task'
            });
        }
    });
});



// Delete task
app.delete('/api/kanban/deletetask', async (request, response) => {
    try {
        const result = await database.collection('kanban-tasks').deleteOne({
            id: request.query.id
        });

        if (result.deletedCount === 1) {
            response.json("Task deleted successfully");
        } else {
            response.status(404).json("Task not found");
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        response.status(500).json("Error deleting task");
    }
});