const {check} = require('express-validator')
const usersRepo = require('../../repositories/users')

module.exports = {
  // check 'Title' with the following validations:
  requireTitle: check('title')
    //Remove spaces
    .trim()
    // Makes sure the title is between 5 and 40 characters in length
    .isLength({min:5, max:40})
    .withMessage('Must be between 5 and 40 characters'),

    // Check 'Price' with the following validations:
    requirePrice: check('price')
      //Remove spaces
      .trim()
      // Take the string and extract a number, including decimal numbers
      .toFloat()
      // Makes sure there is a number in the string
      .isFloat({min:1})
      .withMessage('Must be a number greater than 1'),

    // Check 'email' with the following validations:
  requireEmail : check('email')
    // Removes spaces
    .trim()
    // Checks the format is a correct email format
    .normalizeEmail()
    .isEmail()
    // Error message that will be displayed if value is not valid
    .withMessage('Invalid Email')
    // Custom validator:
    .custom(async email => {
      // Check if there is already a user with this email value.
      const existingUser = await usersRepo.getOneBy({ email });
      // If email already in use, send message 'Email in use'
      if (existingUser) {
        throw new Error('Email in use!')
  }
    }),

    requirePassword: check('password')
    .trim()
    .isLength({min: 4, max:20})
    .withMessage('Password must be between 4 and 20 characters'),

    requirePasswordConfirmation: check('passwordConfirmation')
    .trim()
    .isLength({min: 4, max:20})
    .withMessage('Password must be between 4 and 20 characters')
    .custom(async (passwordConfirmation, {req}) => {
      // Check if values of 'password' and 'passwordConfirmation' match. If not, send error message
      if (passwordConfirmation !== req.body.password) {
        throw new Error('Passwords entered do not match!');
  }
    }),

    requireEmailExists: check('email')
	  .trim()
	  .normalizeEmail()
	  .isEmail()
	  .withMessage('Must provide a valid email')
	  .custom( async (email) => {
		  const user = await usersRepo.getOneBy({ email })
		  if(!user){
			  throw new Error('Email not found!')
		  }
    }),
    
    requireValidPasswordForUser: check('password')
	  .trim()
	  .custom( async (password, { req }) => {
		// Retrieve the user based on the email provided by extracting the 'req' object.
		const user = await usersRepo.getOneBy({email: req.body.email})
		// Checks if a user was found and throws an error if not. Prevents 'undefined' errors
		if(!user){
			throw new Error('Invalid Password!')
		}
		// Compare the password saved to database against the password provided by user
		const validPassword = await usersRepo.comparePasswords(
			user.password,
			password
		)
		// If the 2 passwords do not match, throw an error of 'Invalid Password!'
		if (!validPassword) {
			throw new Error('Invalid Password!')
		}
	  })
}