const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const themeRoutes = require("./routes/themeRoutes");
const path = require("path");

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
app.use("/v1", themeRoutes);
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});

module.exports = app;
