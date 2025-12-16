import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

const testUsers = [
    {
        firstname: 'Admin',
        lastname: 'User',
        username: 'admin',
        email: 'admin@nvnafrica.org',
        password: 'Admin123!',
        phone: '+234800000001',
        role: 'admin',
        gender: 'male',
        isApproved: true,
        email_verified: true,
        date_of_birth: new Date('1985-01-15'),
        address: 'Abuja, Nigeria',
    },
    {
        firstname: 'Sarah',
        lastname: 'Mobilizer',
        username: 'mobilizer',
        email: 'mobilizer@nvnafrica.org',
        password: 'Mobilizer123!',
        phone: '+234800000002',
        role: 'mobilizer',
        gender: 'female',
        isApproved: true,
        email_verified: true,
        date_of_birth: new Date('1990-06-20'),
        address: 'Lagos, Nigeria',
    },
    {
        firstname: 'John',
        lastname: 'Volunteer',
        username: 'volunteer',
        email: 'volunteer@nvnafrica.org',
        password: 'Volunteer123!',
        phone: '+234800000003',
        role: 'volunteer',
        gender: 'male',
        isApproved: true,
        email_verified: true,
        date_of_birth: new Date('1998-05-15'),
        address: 'Lagos, Nigeria',
    },
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        // Clear existing test users
        for (const user of testUsers) {
            await User.deleteOne({ email: user.email });
        }
        console.log('🗑️  Cleared existing test users');

        // Create new test users
        for (const userData of testUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword,
            });
            await user.save();
            console.log(`✅ Created ${userData.role}: ${userData.email}`);
        }

        console.log('\n🎉 Seed completed! Test accounts:');
        console.log('─'.repeat(50));
        console.log('| Role       | Email                    | Password      |');
        console.log('─'.repeat(50));
        console.log('| Admin      | admin@nvnafrica.org      | Admin123!     |');
        console.log('| Mobilizer  | mobilizer@nvnafrica.org  | Mobilizer123! |');
        console.log('| Volunteer  | volunteer@nvnafrica.org  | Volunteer123! |');
        console.log('─'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedUsers();
