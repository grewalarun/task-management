const mongoose = require("mongoose");
const MONGO_URI = "mongodb+srv://arunkumargrewal:India%40135@cluster0.lnfxcag.mongodb.net/task_manager";
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
