const express = require('express');
const { getProducts, createProduct } = require('../controllers/product');
const router = express.Router();

// GET PRODUCT
router.get('/', getProducts);

// CREATE PRODUCT
router.post('/', createProduct);

module.exports = router;
