const User = require('../models/user')

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        //if user found, we add that user information to req object with the name of profile
        req.profile = user
        next();
    });
};
