const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const verifyJWT = require('./middlewares/verifyJWT');
const credentials = require('./middlewares/credentials');
const corsOptions = require('./config/corsOptions');

const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');

// middleware logger
app.use(logger(':method :url :status'));

// handle options credentials check - before CORS & fetch cookies credentials requirement
app.use(credentials);

// cross origin resource sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// routes
app.use('/auth', authRoute);
app.use(verifyJWT);
app.use('/api/users', usersRoute);

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
