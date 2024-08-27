const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const app = express();

// Setup multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hospital', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Patient model
const Patient = mongoose.model('Patient', new mongoose.Schema({
    name: String,
    dob: Date,
    age: Number,
    symptoms: String,
    diagnosis: String,
    physician: String,
   
    status: { type: String, default: 'Off drip' },
    image: { type: String, default: 'default.png' },
    medicines: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }]
}));

// Routes
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching patients.' });
    }
});

app.get('/api/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ error: 'Patient not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching patient.' });
    }
});

app.post('/api/patients', upload.single('image'), async (req, res) => {
    try {
        // Process form data
        const newPatientData = {
            name: req.body.name,
            dob: new Date(req.body.dob),
            age: req.body.age,
            symptoms: req.body.symptoms,
            diagnosis: req.body.diagnosis,
            physician: req.body.physician,
            status: req.body.status || 'Off drip',
            image: req.file ? req.file.filename : 'default.png',
            medicines: req.body.medName.map((name, index) => ({
                name,
                dosage: req.body.dosage[index],
                frequency: req.body.frequency[index],
                duration: req.body.duration[index]
            }))
        };

        const newPatient = new Patient(newPatientData);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(500).json({ error: 'Error adding patient.' });
    }
});

app.delete('/api/patients/:id', async (req, res) => {
    try {
        const result = await Patient.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ message: 'Patient deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Patient not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting patient.' });
    }
});


app.get('/api/search-patients', async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const patients = await Patient.find({ 
            name: { $regex: searchTerm, $options: 'i' } // Case-insensitive search
        }).select('name'); // Only return the name field

        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Error searching patients.' });
    }
});


app.patch('/api/patients/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedPatient) {
            res.json(updatedPatient);
        } else {
            res.status(404).json({ error: 'Patient not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating patient.' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
