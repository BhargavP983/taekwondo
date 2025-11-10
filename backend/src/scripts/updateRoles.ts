import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateRoles() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const User = mongoose.connection.collection('users');

    // Update all users with old role format to new format
    const result = await User.updateMany(
      { role: 'super_admin' },
      { $set: { role: 'superAdmin' } }
    );
    console.log('Updated super_admin:', result.modifiedCount);

    const result2 = await User.updateMany(
      { role: 'state_admin' },
      { $set: { role: 'stateAdmin' } }
    );
    console.log('Updated state_admin:', result2.modifiedCount);

    const result3 = await User.updateMany(
      { role: 'district_admin' },
      { $set: { role: 'districtAdmin' } }
    );
    console.log('Updated district_admin:', result3.modifiedCount);

    console.log('Role migration completed successfully');
  } catch (error) {
    console.error('Error updating roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateRoles();