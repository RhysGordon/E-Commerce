const express = require('express')

const { handleErrors } = require('./middlewares')
const usersRepo = require('../../repositories/users')
const signupTemplate = require('../../views/admin/auth/signup')
const signinTemplate = require('../../views/admin/auth/signin')
const { requireEmail, requirePassword, requirePasswordConfirmation, requireEmailExists, requireValidPasswordForUser } = require('./validators')
const signup = require('../../views/admin/auth/signup')

// Sub router to link the route handlers to 'app' inside 'index.js'
const router = express.Router()

// Route Handler - Tells server what to do when receiving network request from browser
router.get('/signup', (req, res) => {
	res.send(signupTemplate({ req }));
});

// Tells server how to handle 'post' requests
router.post('/signup', [
    requireEmail,
	requirePassword,
	requirePasswordConfirmation

],
// Execute the 'handleErrors' middleware to check for errors. Will return 'signupTemplate'
handleErrors(signupTemplate),
async (req, res) => {
	// Extract email and password properties from req.body object
	const { email, password } = req.body;

	// Create a user in the user repository to represent this person
	const user = await usersRepo.create({ email, password });

	// Store the ID of this user inside the users cookie
	req.session.userId = user.id;

	res.redirect('/admin/products')
});

// Signs the user out by telling browser to forget cookie information and displays message to user
router.get('/signout', (req, res) => {
	req.session = null;
	res.send('You are logged out');
});

// Displays sign in page when user visits /signin page
router.get('/signin', (req, res) => {
	res.send(signinTemplate({}));
});

// Validate user information and sign in
router.post('/signin', [
	requireEmailExists,
	requireValidPasswordForUser
],
// Execute the 'handleErrors' middleware to check for errors. Will return 'signinTemplate'
handleErrors(signinTemplate),
async (req, res) => {
	// Extract email property from req.body
	const { email } = req.body;

	const user = await usersRepo.getOneBy({email})

	// Consider user authenticated with app and signed in
	req.session.userId = user.id;

	// Redirect user to '/admin/products' on successful signin
	res.redirect('/admin/products')
});

module.exports = router
