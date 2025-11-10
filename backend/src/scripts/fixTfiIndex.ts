import mongoose from 'mongoose';
import { Cadet } from '../models/cadet';
import { Poomsae } from '../models/poomsae';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ap-taekwondo';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Fix Cadet tfiIdCardNo index
    console.log('\n🔍 Checking Cadet tfiIdCardNo index...');
    const cadetIndexes = await Cadet.collection.indexes();
    console.log('Current Cadet indexes:', JSON.stringify(cadetIndexes, null, 2));

    const tfiIndex = cadetIndexes.find((i: any) => i.key && i.key.tfiIdCardNo === 1);
    if (tfiIndex) {
      if (!tfiIndex.partialFilterExpression) {
        console.log('⚠️ Found legacy unique index without partial filter. Dropping it...');
        await Cadet.collection.dropIndex(tfiIndex.name || 'tfiIdCardNo_1');
        console.log('✅ Dropped old index');
        
        console.log('Creating new partial unique index...');
        await Cadet.collection.createIndex(
          { tfiIdCardNo: 1 },
          { 
            unique: true, 
            partialFilterExpression: { tfiIdCardNo: { $exists: true, $gt: '' } },
            name: 'tfiIdCardNo_partial_unique'
          }
        );
        console.log('✅ Created new partial unique index for Cadet tfiIdCardNo');
      } else {
        console.log('✅ Cadet tfiIdCardNo already has correct partial unique index');
      }
    } else {
      console.log('Creating partial unique index for tfiIdCardNo...');
      await Cadet.collection.createIndex(
        { tfiIdCardNo: 1 },
        { 
          unique: true, 
          partialFilterExpression: { tfiIdCardNo: { $exists: true, $gt: '' } },
          name: 'tfiIdCardNo_partial_unique'
        }
      );
      console.log('✅ Created partial unique index for Cadet tfiIdCardNo');
    }

    // Fix Poomsae tfiIdNo index
    console.log('\n🔍 Checking Poomsae tfiIdNo index...');
    const poomsaeIndexes = await Poomsae.collection.indexes();
    console.log('Current Poomsae indexes:', JSON.stringify(poomsaeIndexes, null, 2));

    const poomsaeTfiIndex = poomsaeIndexes.find((i: any) => i.key && i.key.tfiIdNo === 1);
    if (poomsaeTfiIndex) {
      if (!poomsaeTfiIndex.partialFilterExpression) {
        console.log('⚠️ Found legacy unique index without partial filter. Dropping it...');
        await Poomsae.collection.dropIndex(poomsaeTfiIndex.name || 'tfiIdNo_1');
        console.log('✅ Dropped old index');
        
        console.log('Creating new partial unique index...');
        await Poomsae.collection.createIndex(
          { tfiIdNo: 1 },
          { 
            unique: true, 
            partialFilterExpression: { tfiIdNo: { $exists: true, $gt: '' } },
            name: 'tfiIdNo_partial_unique'
          }
        );
        console.log('✅ Created new partial unique index for Poomsae tfiIdNo');
      } else {
        console.log('✅ Poomsae tfiIdNo already has correct partial unique index');
      }
    } else {
      console.log('Creating partial unique index for tfiIdNo...');
      await Poomsae.collection.createIndex(
        { tfiIdNo: 1 },
        { 
          unique: true, 
          partialFilterExpression: { tfiIdNo: { $exists: true, $gt: '' } },
          name: 'tfiIdNo_partial_unique'
        }
      );
      console.log('✅ Created partial unique index for Poomsae tfiIdNo');
    }

    console.log('\n✅ Index fix completed successfully!');
    console.log('\nYou can now restart your backend server.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
