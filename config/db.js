const mongoose = require("mongoose");
const MONGO_URI = "mongodb+srv://Vercel-Admin-task-management:4qpJb4T4WSKzG0p2@task-management.sy9u0nn.mongodb.net/?retryWrites=true&w=majority";
//const  MONGO_URI = "mongodb://127.0.0.1:27017/task_manager"
const connectDB = async () => {
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
