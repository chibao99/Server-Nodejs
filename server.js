const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

//connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => res.send("API running"));

//Define Routes
app.use("/api/products", require("./routes/api/product"));
app.use("/api/contact", require("./routes/api/contact"));
app.use("/api/checkout", require("./routes/api/checkout"));
app.use("/api/catalog", require("./routes/api/catalog"));
app.use("/api/users", require("./routes/api/user"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/comments", require("./routes/api/comment"));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server ${PORT}`));
