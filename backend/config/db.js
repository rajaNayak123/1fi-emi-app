import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let connected = false;

export async function connectDB() {
  if (connected) return mongoose.connection;
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGODB_URI);
  connected = true;
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  return mongoose.connection;
}

export default mongoose;
