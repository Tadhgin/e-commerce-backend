// Import required module
const { Tag } = require('../models');

// Define tag data
const tagData = [
  {
    tag_name: 'rock music',
  },
  {
    tag_name: 'pop music',
  },
  {
    tag_name: 'blue',
  },
  {
    tag_name: 'red',
  },
  {
    tag_name: 'green',
  },
  {
    tag_name: 'white',
  },
  {
    tag_name: 'gold',
  },
  {
    tag_name: 'pop culture',
  },
];

// Define function to seed the database with tag data
const seedTags = () => Tag.bulkCreate(tagData);

// Export seedTags function
module.exports = seedTags;
