// Import required modules
const seedCategories = require('./category-seeds');
const seedProducts = require('./product-seeds');
const seedTags = require('./tag-seeds');
const seedProductTags = require('./product-tag-seeds');
const sequelize = require('../config/connection');

// Define function to seed the database with all data
const seedAll = async () => {
  // Sync sequelize models to the database
  await sequelize.sync({ force: true });
  console.log('\n----- DATABASE SYNCED -----\n');

  // Seed categories
  await seedCategories();
  console.log('\n----- CATEGORIES SEEDED -----\n');

  // Seed products
  await seedProducts();
  console.log('\n----- PRODUCTS SEEDED -----\n');

  // Seed tags
  await seedTags();
  console.log('\n----- TAGS SEEDED -----\n');

  // Seed product tags
  await seedProductTags();
  console.log('\n----- PRODUCT TAGS SEEDED -----\n');

  // Exit process
  process.exit(0);
};

// Call seedAll function
seedAll();
