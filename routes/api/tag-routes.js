// Import required modules
const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// Define endpoints for `/api/tags`

// Find all tags
router.get('/', (req, res) => {
  Tag.findAll({
    // Include associated Product data
    include: [
      {
        model: Product,
        through: ProductTag
      }
    ]
  })
  .then(dbTagData => res.json(dbTagData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// Find a single tag by its `id`
router.get('/:id', (req, res) => {
  Tag.findOne({
    where: {
      id: req.params.id
    },
    // Include associated Product data
    include: [
      {
        model: Product,
        through: ProductTag
      }
    ]
  })
  .then(dbTagData => {
    if (!dbTagData) {
      res.status(404).json({ message: 'No products found with this id' });
      return;
    }
    res.json(dbTagData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// Create a new tag
router.post('/', (req, res) => {
  Tag.create(req.body)
    .then(dbTagData => res.json(dbTagData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// Update a tag's name by its `id` value
router.put('/:id', (req, res) => {
  Tag.update(req.body,
    {
      where: {
        id: req.params.id
      }
    })
    .then(dbTagData => {
      if (!dbTagData[0]) {
        res.status(404).json({ message: 'No products found with this id' });
        return;
      }
      res.json(dbTagData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Delete a tag by its `id` value
router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(dbTagData => {
    if (!dbTagData) {
      res.status(404).json({ message: 'No products found with this id' });
      return;
    }
    res.json(dbTagData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// Export router
module.exports = router;
