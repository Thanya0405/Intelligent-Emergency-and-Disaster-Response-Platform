require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Alert = require('./models/Alert');
const FamilyMember = require('./models/FamilyMember');
const Emergency = require('./models/Emergency');

const connectDB = require('./config/db');

const seed = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Alert.deleteMany({}),
      FamilyMember.deleteMany({}),
      Emergency.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@safeguard.ai',
      passwordHash: 'admin123',
      role: 'admin',
      age: 35,
      bloodGroup: 'O+',
      onboardingComplete: true,
      medicalConditions: [],
      emergencyContacts: [{ name: 'Emergency Contact', phone: '+911234567890', relation: 'Colleague' }]
    });

    const demoUser = await User.create({
      name: 'Rahul Sharma',
      email: 'demo@safeguard.ai',
      passwordHash: 'user123',
      role: 'user',
      age: 28,
      bloodGroup: 'B+',
      onboardingComplete: true,
      phone: '+919876543210',
      location: { lat: 19.076, lng: 72.8777 },
      medicalConditions: ['Mild Asthma'],
      emergencyContacts: [
        { name: 'Priya Sharma', phone: '+919876543211', relation: 'Wife' },
        { name: 'Vijay Sharma', phone: '+919876543212', relation: 'Father' }
      ]
    });

    console.log('👤 Demo users created');
    console.log('   Admin: admin@safeguard.ai / admin123');
    console.log('   User:  demo@safeguard.ai / user123');

    // Create demo hospitals (Mumbai area)
    const hospitals = await Hospital.insertMany([
      {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        location: { lat: 28.5672, lng: 77.21, address: 'Ansari Nagar, New Delhi' },
        capacity: 2478,
        availableBeds: 312,
        specialties: ['Trauma', 'Cardiology', 'Neurology', 'Orthopedics', 'Burns'],
        phone: '011-26588500',
        emergencyPhone: '011-26588700',
        type: 'government',
        rating: 4.8,
        isActive: true
      },
      {
        name: 'Lilavati Hospital & Research Centre',
        location: { lat: 19.0493, lng: 72.8260, address: 'Bandra West, Mumbai' },
        capacity: 323,
        availableBeds: 87,
        specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
        phone: '022-26751000',
        emergencyPhone: '022-26751001',
        type: 'private',
        rating: 4.5,
        isActive: true
      },
      {
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        location: { lat: 19.1307, lng: 72.8270, address: 'Andheri West, Mumbai' },
        capacity: 750,
        availableBeds: 143,
        specialties: ['Cardiac Surgery', 'Neurosurgery', 'Oncology', 'Transplant'],
        phone: '022-30999999',
        emergencyPhone: '022-30999900',
        type: 'private',
        rating: 4.7,
        isActive: true
      },
      {
        name: 'KEM Hospital (King Edward Memorial)',
        location: { lat: 19.0019, lng: 72.8397, address: 'Parel, Mumbai' },
        capacity: 1800,
        availableBeds: 423,
        specialties: ['Trauma', 'Burns', 'Neurology', 'General Surgery', 'Pediatrics'],
        phone: '022-24136051',
        emergencyPhone: '022-24136000',
        type: 'government',
        rating: 4.2,
        isActive: true
      },
      {
        name: 'Apollo Hospitals',
        location: { lat: 13.0604, lng: 80.2496, address: 'Greams Road, Chennai' },
        capacity: 600,
        availableBeds: 98,
        specialties: ['Cardiology', 'Orthopedics', 'Oncology', 'Transplant'],
        phone: '044-28290200',
        emergencyPhone: '044-28290200',
        type: 'private',
        rating: 4.6,
        isActive: true
      },
      {
        name: 'Government General Hospital',
        location: { lat: 13.0836, lng: 80.2782, address: 'Park Town, Chennai' },
        capacity: 2600,
        availableBeds: 567,
        specialties: ['Emergency', 'Trauma', 'General Medicine', 'Surgery'],
        phone: '044-25305000',
        emergencyPhone: '044-25305100',
        type: 'government',
        rating: 3.9,
        isActive: true
      },
      {
        name: 'Fortis Hospital Bangalore',
        location: { lat: 13.0280, lng: 77.5543, address: 'Bannerghatta Road, Bangalore' },
        capacity: 400,
        availableBeds: 76,
        specialties: ['Neurosurgery', 'Cardiac', 'Robotic Surgery', 'Oncology'],
        phone: '080-66214444',
        emergencyPhone: '080-66214000',
        type: 'private',
        rating: 4.5,
        isActive: true
      },
      {
        name: 'Nair Hospital (BYL Nair)',
        location: { lat: 19.0358, lng: 72.8426, address: 'Mumbai Central, Mumbai' },
        capacity: 1000,
        availableBeds: 234,
        specialties: ['Trauma', 'Emergency', 'General Surgery', 'Pediatrics'],
        phone: '022-23027601',
        emergencyPhone: '022-23082222',
        type: 'government',
        rating: 4.1,
        isActive: true
      }
    ]);
    console.log(`🏥 ${hospitals.length} hospitals seeded`);

    // Create demo alerts
    const alerts = await Alert.insertMany([
      {
        type: 'flood',
        severity: 'high',
        title: 'Flood Warning — Coastal Maharashtra',
        description: 'Heavy rainfall expected over next 48 hours. Coastal areas at risk of flooding. Rivers at 80% capacity.',
        region: 'Maharashtra',
        location: { lat: 19.0760, lng: 72.8777, radius: 50 },
        safetyInstructions: [
          'Move to higher ground immediately if in low-lying areas',
          'Do not walk or drive through floodwaters',
          'Disconnect electrical appliances',
          'Keep emergency kit ready with water, food, documents',
          'Contact relatives about your safety status'
        ],
        evacuationGuidance: 'Evacuation routes via NH-48, NH-66. Shelters at local schools and community halls.',
        active: true,
        affectedAreas: ['Thane', 'Raigad', 'Palghar', 'Mumbai Suburbs'],
        source: 'IMD + SafeGuard AI'
      },
      {
        type: 'cyclone',
        severity: 'critical',
        title: 'Cyclone Alert — Bay of Bengal',
        description: 'Severe cyclonic storm forming in Bay of Bengal. Wind speeds up to 180 km/h expected to make landfall.',
        region: 'Andhra Pradesh',
        location: { lat: 15.9129, lng: 79.7400, radius: 100 },
        safetyInstructions: [
          'Evacuate coastal areas immediately',
          'Seek shelter in concrete buildings away from coast',
          'Store water and food for 3-5 days',
          'Avoid going outdoors during storm',
          'Follow official government advisories'
        ],
        evacuationGuidance: 'All residents within 5km of coast must evacuate to government shelters. Buses available at district headquarters.',
        active: true,
        affectedAreas: ['Visakhapatnam', 'Krishna', 'Guntur', 'East Godavari'],
        source: 'IMD'
      },
      {
        type: 'earthquake',
        severity: 'medium',
        title: 'Seismic Activity Detected — Gujarat Border',
        description: 'Magnitude 4.2 earthquake detected near Bhuj region. Aftershocks possible in next 24 hours.',
        region: 'Gujarat',
        location: { lat: 23.2420, lng: 69.6669, radius: 30 },
        safetyInstructions: [
          'Move away from buildings and trees',
          'If indoors, take cover under sturdy furniture',
          'Avoid elevators',
          'Check for gas leaks after shaking stops',
          'Be prepared for aftershocks'
        ],
        evacuationGuidance: 'Structural inspections underway. Damaged buildings will be cordoned off.',
        active: true,
        affectedAreas: ['Bhuj', 'Anjar', 'Gandhidham'],
        source: 'IMD Seismology Division'
      },
      {
        type: 'fire',
        severity: 'high',
        title: 'Forest Fire — Uttarakhand Hills',
        description: 'Multiple forest fires reported in Kumaon region due to dry conditions and high winds.',
        region: 'Uttarakhand',
        location: { lat: 29.0588, lng: 80.0580, radius: 40 },
        safetyInstructions: [
          'Evacuate forested areas immediately',
          'Close all windows and doors if sheltering in place',
          'Wear masks to protect from smoke',
          'Keep water source nearby',
          'Do not use fire or produce sparks'
        ],
        evacuationGuidance: 'Forest department and SDRF teams deployed. Avoid hill roads near Munsiyari and Pithoragarh.',
        active: true,
        affectedAreas: ['Pithoragarh', 'Munsiyari', 'Champawat'],
        source: 'NDRF'
      },
      {
        type: 'landslide',
        severity: 'medium',
        title: 'Landslide Risk — Himachal Pradesh',
        description: 'Heavy rainfall has saturated soil in hill districts. High landslide risk on NH-3 and NH-5.',
        region: 'Himachal Pradesh',
        location: { lat: 31.1048, lng: 77.1734, radius: 60 },
        safetyInstructions: [
          'Avoid travel on mountain roads',
          'Stay away from steep slopes and cliff edges',
          'Watch for unusual sounds (cracking, rumbling)',
          'Move to higher ground if water flow suddenly increases or decreases',
          'Report any road cracks or slope movement to authorities'
        ],
        evacuationGuidance: 'NH-3 and NH-5 partially blocked. Use alternate routes via Chandigarh-Shimla expressway.',
        active: true,
        affectedAreas: ['Mandi', 'Kullu', 'Shimla'],
        source: 'HP Disaster Management Authority'
      }
    ]);
    console.log(`🚨 ${alerts.length} alerts seeded`);

    // Create demo family members for demo user
    const familyMembers = await FamilyMember.insertMany([
      {
        userId: demoUser._id,
        memberName: 'Priya Sharma',
        phone: '+919876543211',
        relation: 'Wife',
        location: { lat: 19.0896, lng: 72.8656, address: 'Andheri East, Mumbai' },
        status: 'safe',
        lastUpdate: new Date(),
        bloodGroup: 'A+',
        medicalInfo: 'No known conditions'
      },
      {
        userId: demoUser._id,
        memberName: 'Vijay Sharma',
        phone: '+919876543212',
        relation: 'Father',
        location: { lat: 19.0544, lng: 72.9005, address: 'Kurla, Mumbai' },
        status: 'safe',
        lastUpdate: new Date(),
        bloodGroup: 'O+',
        medicalInfo: 'Diabetes Type 2, Hypertension'
      },
      {
        userId: demoUser._id,
        memberName: 'Sunita Sharma',
        phone: '+919876543213',
        relation: 'Mother',
        location: { lat: 19.0544, lng: 72.9005, address: 'Kurla, Mumbai' },
        status: 'unknown',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        bloodGroup: 'B+',
        medicalInfo: 'Hypertension'
      }
    ]);
    console.log(`👨‍👩‍👧 ${familyMembers.length} family members seeded`);

    // Create demo emergency (historical)
    await Emergency.insertMany([
      {
        userId: demoUser._id,
        type: 'accident',
        severity: 'high',
        location: { lat: 19.0760, lng: 72.8777, address: 'Western Express Highway, Mumbai' },
        status: 'resolved',
        description: 'Vehicle collision on highway, 2 persons injured',
        affectedPersons: 2,
        timeline: [
          { step: 'Emergency triggered', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { step: 'Emergency services alerted', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000) },
          { step: 'Ambulance dispatched', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000) },
          { step: 'Resolved', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000) }
        ],
        resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
      },
      {
        userId: demoUser._id,
        type: 'medical',
        severity: 'medium',
        location: { lat: 19.0896, lng: 72.8656, address: 'Andheri East, Mumbai' },
        status: 'resolved',
        description: 'Chest pain - rushed to hospital',
        affectedPersons: 1,
        timeline: [
          { step: 'SOS triggered', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { step: 'Emergency contacts notified', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 1000) },
          { step: 'Hospital reached', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) },
          { step: 'Resolved - patient stable', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000) }
        ],
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
      }
    ]);
    console.log('📋 Demo emergency history seeded');

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Credentials:');
    console.log('  Admin:  admin@safeguard.ai | admin123');
    console.log('  User:   demo@safeguard.ai  | user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
