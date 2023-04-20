// Import required modules
const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection'); // Import sequelize connection

// Initialize express app and define port
const app = express();
const PORT = process.env.PORT || 3001;

// Set up middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
app.use(routes);

// Start server and sync sequelize models to the database
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening on port', PORT));
});
