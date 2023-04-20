const router = require('express').Router();
const { Category, Product } = require('../../models');

// GET all categories (include associated Products)
router.get('/', (req, res) => {
  Category.findAll({
    include: [Product]
  })
  .then(dbCategoryData => res.json(dbCategoryData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// GET a category by id (include associated Products)
router.get('/:id', (req, res) => {
  Category.findOne({
    where: { id: req.params.id },
    include: [Product]
  })
  .then(dbCategoryData => {
    if (!dbCategoryData) {
        res.status(404).json({ messsage: 'No category found with this id' });
        return;
    }
    res.json(dbCategoryData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// CREATE a new category
router.post('/', (req, res) => {
  Category.create(req.body)
  .then(dbCategoryData => res.json(dbCategoryData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// UPDATE a category by id
router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: { id: req.params.id }
  })
  .then(dbCategoryData => {
    if (!dbCategoryData[0]) {
        res.status(404).json({ message: 'No category found with this id' });
        return;
    }
    res.json(dbCategoryData);
  })
  .catch(err => {
    console.log(err);
    res.json(500).json(err);
  });
});

// DELETE a category by id
router.delete('/:id', (req, res) => {
  Category.destroy({
    where: { id: req.params.id }
  })
  .then(dbCategoryData => {
    if (!dbCategoryData) {
        res.status(404).json({ message: 'No category found with this id' });
        return;
    }
    res.json(dbCategoryData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
