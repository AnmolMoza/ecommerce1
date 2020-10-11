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


//we have user available in the profile because of above middleware
exports.read = (req, res) => {
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile)
}

exports.update = (req, res) => {
    User.findOneAndUpdate({_id: req.profile._id}, {$set: req.body}, {new: true},
        (err, user) => {
            if(err) {
                return res.status(400).json({
                    error: 'You are not authorized to perform this action'
                })
            }
            req.profile.hashed_password = undefined
            req.profile.salt = undefined
            res.json(user)
        })
}
