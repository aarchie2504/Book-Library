import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Book from './models/Book.js';

// Fix DNS resolution for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const seedData = async () => {
  console.log('🔌 Connecting to MongoDB Atlas...');

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log('✅ Connected to MongoDB...');

  await User.deleteMany();
  await Book.deleteMany();
  console.log('🗑️  Cleared existing data...');

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@booklibrary.com',
    password: 'admin123',
    role: 'admin',
  });

  await User.create({
    name: 'Jane Writer',
    email: 'writer@booklibrary.com',
    password: 'writer123',
    role: 'writer',
  });

  await User.create({
    name: 'John Reader',
    email: 'reader@booklibrary.com',
    password: 'reader123',
    role: 'reader',
  });

  await Book.insertMany([
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', publishedYear: 1925, totalCopies: 5, availableCopies: 5, description: 'A classic novel about the American Dream.', addedBy: admin._id },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', publishedYear: 1960, totalCopies: 4, availableCopies: 4, description: 'A powerful story of racial injustice in the American South.', addedBy: admin._id },
    { title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology', publishedYear: 2008, totalCopies: 3, availableCopies: 3, description: 'A handbook of agile software craftsmanship.', addedBy: admin._id },
    { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', publishedYear: 2011, totalCopies: 6, availableCopies: 6, description: 'A brief history of humankind.', addedBy: admin._id },
    { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', publishedYear: 1988, totalCopies: 5, availableCopies: 5, description: "A magical story about following one's dreams.", addedBy: admin._id },
    { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', publishedYear: 2018, totalCopies: 4, availableCopies: 4, description: 'Tiny changes, remarkable results.', addedBy: admin._id },
  ]);

  console.log('✅ Seed data inserted successfully!');
  console.log('👤 Admin:  admin@booklibrary.com  / admin123');
  console.log('✍️  Writer: writer@booklibrary.com / writer123');
  console.log('📖 Reader: reader@booklibrary.com / reader123');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});