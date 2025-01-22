const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const bugRoutes = require("./routes/bugRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bugs", bugRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
