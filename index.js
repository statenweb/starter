const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const path = require("path");
const { validateToken } = require("./middlewares/kinde");

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
app.use("/v1", routes);
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});

module.exports = app;
