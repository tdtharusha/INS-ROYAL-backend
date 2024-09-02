import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Try to connect to the database using the provided cennection atring and options
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If the connection is succeddful, log a message to the console indicating the connection host
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If there is an error connecting to the database, log an error message and exit the process with an error code
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
