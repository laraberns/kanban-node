var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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

// Post task
app.post('/api/kanban/posttask', express.json(), (request, response) => {
    const newTask = {
        id: uuidv4(),
        title: request.body.title,
        completed: request.body.completed,
        doing: request.body.doing,
        completionDate: request.body.completionDate
    };


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

// Update task title
app.put('/api/kanban/updatetask', express.json(), async (request, response) => {
    try {
        const { id, newTitle } = request.body;
        const result = await database.collection('kanban-tasks').updateOne(
            { id },
            { $set: { title: newTitle } }
        );

        if (result.matchedCount === 1) {
            response.json("Task title updated successfully");
        } else {
            response.status(404).json("Task not found");
        }
    } catch (error) {
        console.error("Error updating task title:", error);
        response.status(500).json("Error updating task title");
    }
});
