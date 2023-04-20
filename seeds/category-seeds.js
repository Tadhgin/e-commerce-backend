// Import required module
const { Category } = require('../models');

// Define category data
const categoryData = [
  {
    category_name: 'Shirts',
  },
  {
    category_name: 'Shorts',
  },
  {
    category_name: 'Music',
  },
  {
    category_name: 'Hats',
  },
  {
    category_name: 'Shoes',
  },
];

// Define function to seed the database with category data
const seedCategories = () => Category.bulkCreate(categoryData);

// Export seedCategories function
module.exports = seedCategories;
