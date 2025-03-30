const mongoose = require('mongoose');
const User = require('./models/user-model');
const Box = require('./models/box-model');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, age, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
    await sendOTPEmail(email, otp);

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elderly-care-app');
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany();
    await Box.deleteMany();

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
      password: 'admin123',
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
        profileImage: '/uploads/doctor1-profile.png',
        patients: [],
        alerts: [],
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

    // Patients
    const patients = [
      {
        name: pakistaniNames[0],
        email: 'ayesha.khan@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 65,
        gender: 'F',
        profileImage: '/uploads/patient5-profile.png',
        doctor: savedDoctors[0]._id,
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
        name: pakistaniNames[1],
        email: 'fatima.ahmed@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 70,
        gender: 'F',
        profileImage: '/uploads/patient5-profile.png',
        doctor: savedDoctors[1]._id,
        lastKnownLocation: 'Flatlectron #3, Block A, Defence Housing Authority, Lahore',
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '130/85', status: 'Normal', document: '/uploads/patient-report.png' },
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
        name: pakistaniNames[2],
        email: 'hassan.iqbal@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 68,
        gender: 'M',
        profileImage: '/uploads/patient2-profile.png',
        doctor: savedDoctors[2]._id,
        lastKnownLocation: 'Apartment #10, Sector F-7, Islamabad',
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '140/90', status: 'High', document: '/uploads/patient-report.png' },
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
        name: pakistaniNames[3],
        email: 'zainab.malik@patient.com',
        password: 'patient123',
        role: 'patient',
        age: 72,
        gender: 'F',
        profileImage: '/uploads/patient5-profile.png',
        doctor: savedDoctors[0]._id,
        lastKnownLocation: 'Villa #5, Model Town, Lahore',
        medicalHistory: [
          {
            date: new Date(),
            vitals: [
              { name: 'blood pressure', value: '110/70', status: 'Normal' },
              { name: 'oxygen level', value: '96', status: 'Normal', document: '/uploads/patient-report.png' },
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

      const doctor = await User.findById(patient.doctor);
      if (doctor && !doctor.patients.includes(newPatient._id)) {
        doctor.patients.push(newPatient._id);
        await doctor.save();
      }
      console.log(`Patient ${patient.name} seeded successfully`);
    }

    // Medicine Boxes - 3 boxes per patient
    const medicineBoxes = [
      {
        patient: savedPatients[0], // Ayesha Khan - Hypertension
        boxes: [
          {
            name: "Morning Medication",
            description: "Daily morning hypertension medication",
            timeSlot: "08:00 AM",
            medicines: [
              { name: "Amlodipine", dosage: "5mg", time: "08:00 AM" }
            ]
          },
          {
            name: "Evening Medication",
            description: "Blood pressure management",
            timeSlot: "08:00 PM",
            medicines: [
              { name: "Lisinopril", dosage: "10mg", time: "08:00 PM" }
            ]
          },
          {
            name: "Supplement",
            description: "Daily supplement for heart health",
            timeSlot: "12:00 PM",
            medicines: [
              { name: "Omega-3", dosage: "1000mg", time: "12:00 PM" }
            ]
          }
        ]
      },
      {
        patient: savedPatients[1], // Fatima Ahmed - Diabetes
        boxes: [
          {
            name: "Morning Medication",
            description: "Morning diabetes management",
            timeSlot: "07:00 AM",
            medicines: [
              { name: "Metformin", dosage: "500mg", time: "07:00 AM" }
            ]
          },
          {
            name: "Evening Medication",
            description: "Evening diabetes control",
            timeSlot: "07:00 PM",
            medicines: [
              { name: "Metformin", dosage: "500mg", time: "07:00 PM" }
            ]
          },
          {
            name: "Emergency Medication",
            description: "For low blood sugar episodes",
            timeSlot: "As Needed",
            medicines: [
              { name: "Glucose Tablet", dosage: "15g", time: "As Needed" }
            ]
          }
        ]
      },
      {
        patient: savedPatients[2], // Hassan Iqbal - Arthritis
        boxes: [
          {
            name: "Morning Pain Relief",
            description: "Morning arthritis pain management",
            timeSlot: "08:00 AM",
            medicines: [
              { name: "Ibuprofen", dosage: "400mg", time: "08:00 AM" }
            ]
          },
          {
            name: "Afternoon Pain Relief",
            description: "Afternoon arthritis pain management",
            timeSlot: "02:00 PM",
            medicines: [
              { name: "Ibuprofen", dosage: "400mg", time: "02:00 PM" }
            ]
          },
          {
            name: "Night Pain Relief",
            description: "Night-time arthritis management",
            timeSlot: "09:00 PM",
            medicines: [
              { name: "Acetaminophen", dosage: "500mg", time: "09:00 PM" }
            ]
          }
        ]
      },
      {
        patient: savedPatients[3], // Zainab Malik - Asthma
        boxes: [
          {
            name: "Morning Maintenance",
            description: "Daily asthma prevention",
            timeSlot: "08:00 AM",
            medicines: [
              { name: "Budesonide", dosage: "180mcg", time: "08:00 AM" }
            ]
          },
          {
            name: "Evening Maintenance",
            description: "Evening asthma prevention",
            timeSlot: "08:00 PM",
            medicines: [
              { name: "Budesonide", dosage: "180mcg", time: "08:00 PM" }
            ]
          },
          {
            name: "Rescue Medication",
            description: "Emergency asthma relief",
            timeSlot: "As Needed",
            medicines: [
              { name: "Albuterol", dosage: "2 puffs", time: "As Needed" }
            ]
          }
        ]
      }
    ];

    for (const patientData of medicineBoxes) {
      for (const boxData of patientData.boxes) {
        const newBox = new Box({
          user: patientData.patient._id,
          name: boxData.name,
          description: boxData.description,
          date: new Date(),
          timeSlot: boxData.timeSlot,
          medicines: boxData.medicines.map(med => ({
            name: med.name,
            dosage: med.dosage,
            time: med.time
          }))
        });
        await newBox.save();
        console.log(`Medicine box "${boxData.name}" seeded for ${patientData.patient.name}`);
      }
    }

    // Fall Alerts
    const fallAlerts = [
      {
        doctor: savedDoctors[0],
        patient: savedPatients[0],
        message: `Fall detected for ${savedPatients[0].name} at ${savedPatients[0].lastKnownLocation}`,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        doctor: savedDoctors[0],
        patient: savedPatients[3],
        message: `Fall detected for ${savedPatients[3].name} at ${savedPatients[3].lastKnownLocation}`,
        date: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        doctor: savedDoctors[1],
        patient: savedPatients[1],
        message: `Fall detected for ${savedPatients[1].name} at ${savedPatients[1].lastKnownLocation}`,
        date: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        doctor: savedDoctors[2],
        patient: savedPatients[2],
        message: `Fall detected for ${savedPatients[2].name} at ${savedPatients[2].lastKnownLocation}`,
        date: new Date(Date.now() - 15 * 60 * 1000),
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