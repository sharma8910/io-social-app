import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();

export async function connectDB() {
  try{
    await mongoose.connect(process.env.MONGO_URI
     
    );
    console.log('conection done')
  } catch (error){
    console.error('NOT connect ', error.message);
    process.exit(1);
  }
  
  
}
