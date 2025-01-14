const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    major: { type: String, required: true },
    enrolled: { type: Boolean, default: true },
});

module.exports = mongoose.model('students', studentSchema);