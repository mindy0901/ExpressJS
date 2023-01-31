const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const credentials = require('./middlewares/credentials');
const corsOptions = require('./config/corsOptions');
const { logErrors, clientErrorHandler, errorHandler } = require('./middlewares/errorMiddleware');

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const productRoute = require('./routes/product');

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

// compress all responses
app.use(compression());

// error handdling
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// routes
app.use('/auth', authRoute);

app.use('/api/users', userRoute);
app.use('/api/products', productRoute);

server.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
