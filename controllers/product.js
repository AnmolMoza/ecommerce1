const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')
const Product = require("../models/product");
const {errorHandler} = require('../helpers/dbErrorHandler')

//Middleware methords for CRUD
exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product) {
            return res.send(400).json({
                error: 'Product not found'
            });
        }
        req.product = product
        next()
    })
}

exports.read =(req, res) => {
    req.product.photo = undefined
    return res.json(req.product)
}

exports.create = (req,res) => {
    //Somewhat different, we have to send form data from client side as we are using the image as well, to do that
    //we use package multer for formidable, here formidable. and also lodash library which has helper
    let form = new formidable.IncomingForm()
    //accept the extensions
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json ( {
                error: 'Image could not be uploaded!'
            })
        }

        //check for all the fields
        const {name, description, price, category, quantity, shipping} = fields
        if(!name || !description || !price || !category ||!quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        //For form data
        let product = new Product(fields)
        //For files
        //1kb = 1000
        //1mb = 1000000
        if(files.photo) {
            if(files.photo.size > 1000000) {
                return res.send(400).json({
                    error: "Image should be less than 1mb in size"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type 
        }
        product.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(error)
                })
            }
            res.json(result)
        })

    })

}

exports.remove = (req,res) => {
    //get whatever product we are getting from the route
    let product = req.product
    product.remove((err, deletedProduct) => {
        if(err) {
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        res.json({
            "message": 'Product Deleted'
        })
    })
}


exports.update = (req,res) => {
    //Somewhat different, we have to send form data from client side as we are using the image as well, to do that
    //we use package multer for formidable, here formidable. and also lodash library which has helper
    let form = new formidable.IncomingForm()
    //accept the extensions
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json ( {
                error: 'Image could not be uploaded!'
            })
        }

        //check for all the fields
        const {name, description, price, category, quantity, shipping} = fields
        if(!name || !description || !price || !category ||!quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        //For form data
        let product = req.product
        product = _.extend(product, fields)
        if(files.photo) {
            if(files.photo.size > 1000000) {
                return res.send(400).json({
                    error: "Image should be less than 1mb in size"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type 
        }
        product.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(error)
                })
            }
            res.json(result)
        })

    })
}


/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
*/

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find()
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) =>{
            if(err) {
                return res.status(400).json({
                    error: "Produts not found"
                })
            }
            res.json(products)
        })
}

//List related products
/**
 *It will find the products based on the request product category
 *other products that have the same category will be returned
 */
exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6
    //find all product except the current product of same category
    Product.find({_id: {$ne: req.product}, category: req.product.category})
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: "Produts not found"
            })
        }
        res.json(products)
    })
}

exports.listCategories = (req, res) => {
    Product.distinct('category', {}, (err, categories) => {
        if(err) {
            return res.status(400).json({
                error: "categories not found"
            })
        }
        res.json(categories)
    })
}


/**
 *List products by search
 *We will implement product by search in react frontend
 *we will show categories in checkbox and price range in radio buttons
 *as the user clicks on those checkbox and radio buttons
 *we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
    let order = req.query.order ? req.query.order : 'desc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 100
    let skip = parseInt(req.body.skip)
    let findArgs = {}

    //console.log(order, sortBy, limit, skip, req.body.filters)
    //console.log('findArgs', findArgs)

    for (let key in req.body.filters) {
        if(req.body.filters[key].length > 0) {
            if(key==='price') {
                //gte- greater than price [0-10]
                //lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key]
            }
        }
    }

    Product.find(findArgs)
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if(err) {
                return res.status(400).json({
                    error: "Products not found"
                })
            }

            res.json({
                size: data.length,
                data
            })
        })
}


exports.photo = (req,res, next) => {
    if(req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}