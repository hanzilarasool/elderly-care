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

    // Doctors with initial alerts
    const doctors = [
      {
        name: 'Dr. Ahmed Khan',
        email: 'ahmed.khan@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 35,
        gender: 'M',
        specialization: 'Cardiology',
        profileImage: '/uploads/doctor1-profile.png',
        patients: [],
        alerts: [], // Will be populated with patient fall alerts later
      },
      {
        name: 'Dr. Sobia Malik',
        email: 'sobia.malik@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 32,
        gender: 'F',
        specialization: 'Neurology',
        profileImage: '/uploads/doctor4-profile.png',
        patients: [],
        alerts: [],
      },
      {
        name: 'Dr. Faisal Ahmed',
        email: 'faisal.ahmed@doctor.com',
        password: 'doctor123',
        role: 'doctor',
        age: 38,
        gender: 'M',
        specialization: 'Orthopedics',
        profileImage: '/uploads/doctor2-profile.png',
        patients: [],
        alerts: [],
      },
    ];

    const savedDoctors = [];
    for (const doctor of doctors) {
      const newDoctor = new User(doctor);
      await newDoctor.save();
      savedDoctors.push(newDoctor);
      console.log(`Doctor ${doctor.name} seeded successfully`);
    }

    // Patients with lastKnownLocation and medical history
    const patients = [
      {
        name: pakistaniNames[0], // Ayesha Khan (F)
        email: 'ayesha.khan@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 65,
        gender: 'F',
        profileImage: '/uploads/patient1-profile.png',
        doctor: savedDoctors[0]._id, // Dr. Ahmed Khan
        lastKnownLocation: 'House #12, Street 5, Gulshan-e-Iqbal, Karachi',
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '120/80', status: 'Normal', document: '/uploads/patient1-report1.pdf' },
              { name: 'heart rate', value: '72', status: 'Normal' },
            ],
            diseases: [{ name: 'Hypertension' }],
            notes: 'Stable condition.',
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
        profileImage: '/uploads/patient1-profile.png',
        doctor: savedDoctors[1]._id, // Dr. Sobia Malik
        lastKnownLocation: 'Flat #3, Block A, Defence Housing Authority, Lahore',
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '130/85', status: 'Normal', document: '/uploads/patient2-report1.pdf' },
              { name: 'heart rate', value: '80', status: 'Normal' },
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
        profileImage: '/uploads/patient2-profile.png',
        doctor: savedDoctors[2]._id, // Dr. Faisal Ahmed
        lastKnownLocation: 'Apartment #10, Sector F-7, Islamabad',
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
        profileImage: '/uploads/patient1-profile.png',
        doctor: savedDoctors[0]._id, // Dr. Ahmed Khan
        lastKnownLocation: 'Villa #5, Model Town, Lahore',
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
    ];

    const savedPatients = [];
    for (const patient of patients) {
      const newPatient = new User(patient);
      await newPatient.save();
      savedPatients.push(newPatient);

      // Update doctor's patients list
      const doctor = await User.findById(patient.doctor);
      if (doctor && !doctor.patients.includes(newPatient._id)) {
        doctor.patients.push(newPatient._id);
        await doctor.save();
      }
      console.log(`Patient ${patient.name} seeded successfully`);
    }

    // Seed fall alerts for doctors
    const fallAlerts = [
      {
        doctor: savedDoctors[0], // Dr. Ahmed Khan
        patient: savedPatients[0], // Ayesha Khan
        message: `Fall detected for ${savedPatients[0].name} at ${savedPatients[0].lastKnownLocation}`,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        doctor: savedDoctors[0], // Dr. Ahmed Khan
        patient: savedPatients[3], // Zainab Malik
        message: `Fall detected for ${savedPatients[3].name} at ${savedPatients[3].lastKnownLocation}`,
        date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        doctor: savedDoctors[1], // Dr. Sobia Malik
        patient: savedPatients[1], // Fatima Ahmed
        message: `Fall detected for ${savedPatients[1].name} at ${savedPatients[1].lastKnownLocation}`,
        date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        doctor: savedDoctors[2], // Dr. Faisal Ahmed
        patient: savedPatients[2], // Hassan Iqbal
        message: `Fall detected for ${savedPatients[2].name} at ${savedPatients[2].lastKnownLocation}`,
        date: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
    ];

    for (const alert of fallAlerts) {
      await User.updateOne(
        { _id: alert.doctor._id },
        {
          $push: {
            alerts: {
              message: alert.message,
              date: alert.date,
              relatedPatient: alert.patient._id,
              dismissed: false,
            },
          },
        }
      );
      console.log(`Fall alert for ${alert.patient.name} added to ${alert.doctor.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();