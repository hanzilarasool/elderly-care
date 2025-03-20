// backend/seed.js
const mongoose = require('mongoose');
const User = require('./models/user-model');
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
      profileImage: '/uploads/admin-profile.png',
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
        profileImage: '/uploads/doctor1-profile.png', // Male
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
        profileImage: '/uploads/doctor4-profile.png', // Female
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
        profileImage: '/uploads/doctor2-profile.png', // Male
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
        profileImage: '/uploads/doctor4-profile.png', // Female
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
        profileImage: '/uploads/doctor3-profile.png', // Male
        patients: [],
      },
    ];

    const savedDoctors = [];
    for (const doctor of doctors) {
      const newDoctor = new User(doctor);
      await newDoctor.save();
      savedDoctors.push(newDoctor);
      console.log(`Doctor ${doctor.name} seeded successfully`);
    }

    // Patients with new medical history structure
    const patients = [
      {
        name: pakistaniNames[0], // Ayesha Khan (F)
        email: 'ayesha.khan@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 65,
        gender: 'F',
        profileImage: '/uploads/patient1-profile.png', // Female
        doctor: savedDoctors[0]._id, // Dr. Ahmed Khan
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '120/80', status: 'Normal', document: '/uploads/patient1-report1.pdf' },
              { name: 'heart rate', value: '72', status: 'Normal' },
              { name: 'oxygen level', value: '98', status: 'Normal' },
            ],
            diseases: [{ name: 'Hypertension' }],
            notes: 'Stable condition, regular monitoring needed.',
            documents: [],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[1], // Fatima Ahmed (F)
        email: 'fatima.ahmed@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 70,
        gender: 'F',
        profileImage: '/uploads/patient1-profile.png', // Female
        doctor: savedDoctors[1]._id, // Dr. Sobia Malik
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '130/85', status: 'Normal', document: '/uploads/patient2-report1.pdf' },
              { name: 'heart rate', value: '80', status: 'Normal' },
              { name: 'temperature', value: '36.6', status: 'Normal' },
            ],
            diseases: [{ name: 'Diabetes' }],
            notes: 'Controlled with medication.',
            documents: [],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[2], // Hassan Iqbal (M)
        email: 'hassan.iqbal@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 68,
        gender: 'M',
        profileImage: '/uploads/patient2-profile.png', // Male
        doctor: savedDoctors[2]._id, // Dr. Faisal Ahmed
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '140/90', status: 'High', document: '/uploads/patient3-report1.pdf' },
              { name: 'heart rate', value: '85', status: 'Normal' },
            ],
            diseases: [{ name: 'Arthritis' }],
            notes: 'Pain management ongoing.',
            documents: [],
            status: 'High',
          },
        ],
      },
      {
        name: pakistaniNames[3], // Zainab Malik (F)
        email: 'zainab.malik@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 72,
        gender: 'F',
        profileImage: '/uploads/patient1-profile.png', // Female
        doctor: savedDoctors[3]._id, // Dr. Amina Rashid
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '110/70', status: 'Normal' },
              { name: 'oxygen level', value: '96', status: 'Normal', document: '/uploads/patient4-report1.pdf' },
            ],
            diseases: [{ name: 'Asthma' }],
            notes: 'Mild symptoms, inhaler prescribed.',
            documents: [],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[4], // Omar Farooq (M)
        email: 'omar.farooq@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 67,
        gender: 'M',
        profileImage: '/uploads/patient3-profile.png', // Male
        doctor: savedDoctors[4]._id, // Dr. Zafar Iqbal
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '135/85', status: 'Normal' },
              { name: 'heart rate', value: '78', status: 'Normal', document: '/uploads/patient5-report1.pdf' },
            ],
            diseases: [{ name: 'Heart Disease' }],
            notes: 'Stable, follow-up in 2 weeks.',
            documents: [],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[5], // Sana Ali (F)
        email: 'sana.ali@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 69,
        gender: 'F',
        profileImage: '/uploads/patient1-profile.png', // Female
        doctor: savedDoctors[0]._id, // Dr. Ahmed Khan
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '125/80', status: 'Normal' },
              { name: 'oxygen level', value: '97', status: 'Normal', document: '/uploads/patient6-report1.pdf' },
            ],
            diseases: [{ name: 'Osteoporosis' }],
            notes: 'Calcium supplements prescribed.',
            documents: [],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[6], // Bilal Hussain (M)
        email: 'bilal.hussain@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 71,
        gender: 'M',
        profileImage: '/uploads/patient4-profile.png', // Male
        doctor: savedDoctors[1]._id, // Dr. Sobia Malik
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '145/95', status: 'High', document: '/uploads/patient7-report1.pdf' },
              { name: 'heart rate', value: '90', status: 'Normal' },
            ],
            diseases: [{ name: 'Hypertension' }, { name: 'Diabetes' }],
            notes: 'Medication adjustment needed.',
            documents: [],
            status: 'High',
          },
        ],
      },
      {
        name: pakistaniNames[7], // Nadia Sheikh (F)
        email: 'nadia.sheikh@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 66,
        gender: 'F',
        profileImage: '/uploads/patient1-profile.png', // Female
        doctor: savedDoctors[2]._id, // Dr. Faisal Ahmed
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '115/75', status: 'Normal' },
              { name: 'temperature', value: '37.0', status: 'Normal', document: '/uploads/patient8-report1.pdf' },
            ],
            diseases: [{ name: 'Chronic Fatigue' }],
            notes: 'Rest recommended.',
            documents: [],
            status: 'Normal',
          },
        ],
      },
      {
        name: pakistaniNames[8], // Usman Chaudhry (M)
        email: 'usman.chaudhry@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 73,
        gender: 'M',
        profileImage: '/uploads/patient2-profile.png', // Male
        doctor: savedDoctors[3]._id, // Dr. Amina Rashid
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '130/82', status: 'Normal' },
              { name: 'oxygen level', value: '95', status: 'Low', document: '/uploads/patient9-report1.pdf' },
            ],
            diseases: [{ name: 'COPD' }],
            notes: 'Oxygen therapy advised.',
            documents: [],
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