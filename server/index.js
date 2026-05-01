const express = require("express");
const cors = require("cors");
require("dotenv").config();

const scanRoutes = require("./routes/scan");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/scan", scanRoutes);

app.get("/", (req, res) => {
  res.json({ message: "QR Scanner API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});