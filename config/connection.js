const Sequelize = require('sequelize');

// Load environment variables from .env file
require('dotenv').config();

// Create a new Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Name of the database
  process.env.DB_USER,     // MySQL username
  process.env.DB_PASSWORD, // MySQL password
  {
    host: 'localhost',     // Host name of the database server
    dialect: 'mysql',      // Dialect of the database
    dialectOptions: {
      decimalNumbers: true,// Enable decimal numbers in MySQL
    },
  }
);

// Export the Sequelize instance
module.exports = sequelize;
