// backend/seed.js
const mongoose = require('mongoose');
const User = require('./models/user-model');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elderly-care-app');
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany();

    // Sample Pakistani names
    const pakistaniNames = [
      'Ayesha Khan', 'Fatima Ahmed', 'Hassan Iqbal', 'Zainab Malik', 'Omar Farooq',
      'Sana Ali', 'Bilal Hussain', 'Nadia Sheikh', 'Usman Chaudhry', 'Sara Javed',
      'Imran Butt', 'Rabia Naz', 'Tariq Mehmood', 'Zara Siddiqui', 'Asif Raza'
    ];

    // Admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      age: 40,
      gender: 'M',
      profileImage: './uploads/admin-profile.png',
    });
    await admin.save();
    console.log('Admin seeded successfully');

    // Doctors
    const doctors = [
      {
        name: 'Dr. Ahmed Khan',
        email: 'ahmed.khan@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 35,
        gender: 'M',
        specialization: 'Cardiology',
        profileImage: './uploads/doctor1-profile.png',
        patients: [],
      },
      {
        name: 'Dr. Sobia Malik',
        email: 'sobia.malik@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 32,
        gender: 'F',
        specialization: 'Neurology',
        profileImage: './uploads/doctor2-profile.png',
        patients: [],
      },
      {
        name: 'Dr. Faisal Ahmed',
        email: 'faisal.ahmed@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 38,
        gender: 'M',
        specialization: 'Orthopedics',
        profileImage: './uploads/doctor3-profile.png',
        patients: [],
      },
      {
        name: 'Dr. Amina Rashid',
        email: 'amina.rashid@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 34,
        gender: 'F',
        specialization: 'Pediatrics',
        profileImage: './uploads/doctor4-profile.png',
        patients: [],
      },
      {
        name: 'Dr. Zafar Iqbal',
        email: 'zafar.iqbal@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 40,
        gender: 'M',
        specialization: 'General Medicine',
        profileImage: './uploads/doctor5-profile.png',
        patients: [],
      },
    ];

    for (const doctor of doctors) {
      const newDoctor = new User(doctor);
      await newDoctor.save();
      console.log(`Doctor ${doctor.name} seeded successfully`);
    }

    // Patients with more comprehensive medical history
    const patients = [
      {
        name: pakistaniNames[0], // Ayesha Khan
        email: 'ayesha.khan@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 65,
        gender: 'F',
        profileImage: './uploads/patient1-profile.png',
        doctor: doctors[0]._id, // Dr. Ahmed Khan
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '120/80', 'heart rate': '72', 'oxygen level': '98' },
            diseases: ['Hypertension'],
            notes: 'Stable condition, regular monitoring needed.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[1], // Fatima Ahmed
        email: 'fatima.ahmed@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 70,
        gender: 'F',
        profileImage: './uploads/patient2-profile.png',
        doctor: doctors[1]._id, // Dr. Sobia Malik
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '130/85', 'heart rate': '80', 'temperature': '36.6' },
            diseases: ['Diabetes'],
            notes: 'Controlled with medication.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[2], // Hassan Iqbal
        email: 'hassan.iqbal@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 68,
        gender: 'M',
        profileImage: './uploads/patient3-profile.png',
        doctor: doctors[2]._id, // Dr. Faisal Ahmed
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '140/90', 'heart rate': '85' },
            diseases: ['Arthritis'],
            notes: 'Pain management ongoing.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'High',
          },
        ],
      },
      {
        name: pakistaniNames[3], // Zainab Malik
        email: 'zainab.malik@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 72,
        gender: 'F',
        profileImage: './uploads/patient4-profile.png',
        doctor: doctors[3]._id, // Dr. Amina Rashid
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '110/70', 'oxygen level': '96' },
            diseases: ['Asthma'],
            notes: 'Mild symptoms, inhaler prescribed.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[4], // Omar Farooq
        email: 'omar.farooq@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 67,
        gender: 'M',
        profileImage: './uploads/patient5-profile.png',
        doctor: doctors[4]._id, // Dr. Zafar Iqbal
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '135/85', 'heart rate': '78' },
            diseases: ['Heart Disease'],
            notes: 'Stable, follow-up in 2 weeks.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[5], // Sana Ali
        email: 'sana.ali@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 69,
        gender: 'F',
        profileImage: './uploads/patient4-profile.png',
        doctor: doctors[0]._id, // Dr. Ahmed Khan
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '125/80', 'oxygen level': '97' },
            diseases: ['Osteoporosis'],
            notes: 'Calcium supplements prescribed.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[6], // Bilal Hussain
        email: 'bilal.hussain@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 71,
        gender: 'M',
        profileImage: './uploads/patient3-profile.png',
        doctor: doctors[1]._id, // Dr. Sobia Malik
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '145/95', 'heart rate': '90' },
            diseases: ['Hypertension', 'Diabetes'],
            notes: 'Medication adjustment needed.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'High',
          },
        ],
      },
      {
        name: pakistaniNames[7], // Nadia Sheikh
        email: 'nadia.sheikh@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 66,
        gender: 'F',
        profileImage: './uploads/patient2-profile.png',
        doctor: doctors[2]._id, // Dr. Faisal Ahmed
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '115/75', 'temperature': '37.0' },
            diseases: ['Chronic Fatigue'],
            notes: 'Rest recommended.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[8], // Usman Chaudhry
        email: 'usman.chaudhry@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 73,
        gender: 'M',
        profileImage: './uploads/patient2-profile.png',
        doctor: doctors[3]._id, // Dr. Amina Rashid
        medicalHistory: [
          {
            date: new Date(),
            vitals: { 'blood pressure': '130/82', 'oxygen level': '95' },
            diseases: ['COPD'],
            notes: 'Oxygen therapy advised.',
            documents: ['./uploads/patient1-report1.pdf'],
            status: 'Low',
          },
        ],
      },
    ];

    for (const patient of patients) {
      const newPatient = new User(patient);
      await newPatient.save();
      // Update doctor's patients list
      const doctor = await User.findById(patient.doctor);
      if (doctor && !doctor.patients.includes(newPatient._id)) {
        doctor.patients.push(newPatient._id);
        await doctor.save();
      }
      console.log(`Patient ${patient.name} seeded successfully`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();