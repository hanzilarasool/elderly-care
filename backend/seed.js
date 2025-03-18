const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user-model');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/elderly-care';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('Existing users deleted');

    const users = [
      {
        name: 'Hanzila Rasool',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
      },
      {
        name: 'Ayesha Khalid',
        email: 'admin2@example.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
      },
      {
        name: 'Dr. Hassan Raza',
        email: 'doctor1@example.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        specialization: 'Geriatrics',
        patients: [],
      },
      {
        name: 'Dr. Zara Ahsan',
        email: 'doctor2@example.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        specialization: 'Cardiology',
        patients: [],
      },
      {
        name: 'Dr. Ahmed Tariq',
        email: 'doctor3@example.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        specialization: 'Neurology',
        patients: [],
      },
      {
        name: 'Dr. Maryam Saeed',
        email: 'doctor4@example.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        specialization: 'General Medicine',
        patients: [],
      },
      {
        name: 'Patient Bilal Khan',
        email: 'patient1@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [
          {
            date: new Date('2025-02-10'),
            vitals: { bloodPressure: '130/85', heartRate: 75, temperature: 36.8, oxygenLevel: 97 },
            diseases: ['Diabetes'],
            notes: 'Stable but requires insulin adjustment',
          },
        ],
      },
      {
        name: 'Patient Fatima Noor',
        email: 'patient2@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [
          {
            date: new Date('2025-01-20'),
            vitals: { bloodPressure: '115/75', heartRate: 70, temperature: 36.5, oxygenLevel: 99 },
            diseases: ['Asthma'],
            notes: 'Needs regular inhaler use',
          },
        ],
      },
      {
        name: 'Patient Ali Haider',
        email: 'patient3@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [],
      },
      {
        name: 'Patient Sara Imran',
        email: 'patient4@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [],
      },
      {
        name: 'Patient Hamza Rehman',
        email: 'patient5@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [
          {
            date: new Date('2025-03-01'),
            vitals: { bloodPressure: '140/90', heartRate: 80, temperature: 37.0, oxygenLevel: 96 },
            diseases: ['Hypertension'],
            notes: 'Requires lifestyle changes and medication',
          },
        ],
      },
      {
        name: 'Patient Mahnoor Javed',
        email: 'patient6@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [],
      },
      {
        name: 'Patient Usman Tariq',
        email: 'patient7@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [],
      },
      {
        name: 'Patient Zainab Rafiq',
        email: 'patient8@example.com',
        password: await bcrypt.hash('patient123', 12),
        role: 'patient',
        medicalHistory: [],
      },
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seedUsers();
