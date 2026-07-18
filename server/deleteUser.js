require('dotenv').config();
const mongoose = require('mongoose');

const email = 'chaithyaaiyappa@gmail.com'; // 👈 change if needed

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await mongoose.connection.db
      .collection('users')
      .deleteOne({ email });

    if (result.deletedCount === 1) {
      console.log(`✅ User "${email}" deleted successfully!`);
    } else {
      console.log(`⚠️ No user found with email "${email}"`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

deleteUser();
