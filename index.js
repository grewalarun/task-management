const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
// 🔹 import routes
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const testtaskRoutes = require("./routes/testTask.routes");
connectDB(); // connect to MongoDB
const app = express();

app.use(express.json());
// cors fix

app.use(
  cors([{
    origin: "http://localhost:3000", 
    credentials: true,
  },
  {
    origin: "http://localhost:5173", 
    credentials: true,
  },
{
    origin: "next-taskmanager.netlify.app", 
    credentials: true,
  }])
);
app.options(/.*/, cors());
// 🔹 use routes
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/", taskRoutes); // for nested task routes
app.use("/test/", testtaskRoutes); // for nested task routes
// admin route
app.use("/users", userRoutes);




app.listen(3100, () => {
  console.log("Server is running on port 3100");
});
