const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const adminProductsRouter = require('./routes/admin/products');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();

// Executes 'express.static' on the 'public' folder to make it available to the outside world
app.use(express.static('public'));

// Makes bodyParser run on every request - Without having to rewrite the code every time
app.use(bodyParser.urlencoded({ extended: true }));

// Makes cookieSession run on every request
app.use(
	cookieSession({
		keys: [ '235rfqfrsdf' ]
	})
);

// Initialize routers
app.use(authRouter);

app.use(adminProductsRouter);

app.use(productsRouter);

app.use(cartsRouter);

// Tells app to listen for incoming network traffic on particular port
app.listen(3000, () => {
	console.log('Listening');
});
