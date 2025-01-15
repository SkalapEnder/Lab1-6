const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/school')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error', err));

const collection = mongoose.connection.collection('students');

app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/crud.html'));
})

app.get('/isIdExists', async (req, res) => {
    try {
        const id = Number(req.query.id); // Convert query parameter to a number
        if (isNaN(id)) {
            return res.status(400).json({ result: false, error: 'Invalid ID format' });
        }

        const document = await collection.findOne({ student_id: id });
        res.json({ result: document ? true : false });
    } catch (error) {
        console.error('Error checking if user ID is reserved:', error);
        res.status(500).json({ result: false, error: 'Database error occurred' });
    }
})

// CRUD Endpoints
app.post('/students-create', async (req, res) => {
    try {

        const students = await collection.insertMany(req.body);
        res.status(201).send(students);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/students', async (req, res) => {
    try {
        const students = await collection.find().toArray();
        res.status(200).json(students);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/students', async (req, res) => {
    try {
        const filter = JSON.parse(req.body.filter);
        const students = await collection.find(filter).toArray();
        res.status(200).json(students);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const updatedStudent = await collection.findOneAndUpdate(
            { student_id: parseInt(req.params.id, 10) },
            { $set: req.body },
            { returnDocument: 'after' }
        );
        if (updatedStudent === null) return res.status(404).send('Student not found');
        res.status(200).send(updatedStudent);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        const deletedStudent = await collection.findOneAndDelete({
            student_id: parseInt(req.params.id, 10)
        });
        console.log(deletedStudent);
        if (deletedStudent === null) {
            return res.status(404).send('Student not found');
        }
        res.status(200).send(deletedStudent.value);
    } catch (err) {
        res.status(500).send(err);
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
