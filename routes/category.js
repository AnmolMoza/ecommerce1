const express = require('express')
const router = express.Router()

const { create, categoryById, read, update, remove, list } = require('../controllers/category')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')

router.post('/category/create/:userId',requireSignin, isAdmin, isAuth, create);
//route to get category
router.get('/category/:categoryId', read)
router.put('/category/:categoryId/:userId',requireSignin, isAdmin, isAuth, update);
router.delete('/category/:categoryId/:userId',requireSignin, isAdmin, isAuth, remove);
router.get('/categories', list)


//making middleware for crud operations on categories
router.param('categoryId', categoryById)
router.param('userId', userById)
module.exports = router;