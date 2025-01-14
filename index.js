const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/students')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error', err));

const collection = mongoose.connection.collection('students');

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/crud.html'));
})

// CRUD Endpoints
app.post('/students', async (req, res) => {
    try {
        const students = await collection.insertMany(req.body);
        res.status(201).send(students);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/students', async (req, res) => {
    try {
        const filter = req.query;
        const students = await collection.find(filter);
        res.status(200).send(students);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const updatedStudent = await collection.findOneAndUpdate(
            { id: req.params.id },
            req.body
        );
        if (!updatedStudent) return res.status(404).send('Student not found');
        res.status(200).send(updatedStudent);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        const deletedStudent = await collection.findOneAndDelete({ id: req.params.id });
        if (!deletedStudent) return res.status(404).send('Student not found');
        res.status(200).send(deletedStudent);
    } catch (err) {
        res.status(500).send(err);
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));