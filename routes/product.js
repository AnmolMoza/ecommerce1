const express = require('express')
const router = express.Router()

const { create, productById, read, remove, update, list, listRelated, listCategories,listBySearch, photo } = require('../controllers/product')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { route } = require('./category')

//Route to read a product using the product Id
router.post('/product/create/:userId',requireSignin, isAdmin, isAuth, create);
router.get('/product/:productId', read)
router.delete('/product/:productId/:userId', requireSignin, isAdmin, isAuth, remove)
router.put('/product/:productId/:userId', requireSignin, isAdmin, isAuth, update)

router.get('/products', list)
router.get('/products/related/:productId', listRelated)
//routes to tell how many categories are used
router.get('/products/categories', listCategories)
//route to implement products by product search, we use post because we will be sending the filters
router.post('/products/by/search', listBySearch)
router.get('/product/photo/:productId', photo)



router.param('userId', userById)
router.param('productId', productById)

module.exports = router;