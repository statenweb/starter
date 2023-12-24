const express = require('express');
const bodyParser = require('body-parser');
const themeRoutes = require('./routes/themeRoutes');
const path = require('path');

const app = express();
app.use(bodyParser.json());

app.use('/v1', themeRoutes);
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
