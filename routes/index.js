// Import required modules
const router = require('express').Router();
const apiRoutes = require('./api');

// Use apiRoutes for /api routes
router.use('/api', apiRoutes);

// Catch-all route for wrong routes
router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>")
});

// Export router
module.exports = router;
