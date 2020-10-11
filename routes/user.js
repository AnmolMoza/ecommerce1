const express = require('express')
const router = express.Router()

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

const { userById, read, update } = require('../controllers/user')

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req,res) => {
    res.json({
        user: req.profile
    })
})

//This says that if anytime there is userId in route, we want to execute userById, and make this 
//information available in the request object
router.param('userId', userById)

//Allow user to check profile
router.get('/user/:userId',requireSignin, isAuth, read )
//Allow user to update profile
router.put('/user/:userId',requireSignin, isAuth, update )

module.exports = router;