const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define the patient schema and model
const patientSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    status: String
});

const Patient = mongoose.model('Patient', patientSchema);

// Endpoint to get patient data
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json({ patients });
    } catch (error) {
        res.status(500).send('Error fetching patient data');
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
