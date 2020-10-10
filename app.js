const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
//Allows us to use the env variable
require('dotenv').config() 
//Import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')

//App
const app = express()

//DB and config mongoose
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => console.log('DB Connected'))


//middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())              //To get the json data from the request body
app.use(cookieParser())
app.use(expressValidator());



//Routes middleware
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);


const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is running on the port number ${port}`)
})