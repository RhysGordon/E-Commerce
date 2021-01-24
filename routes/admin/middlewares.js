const {validationResult} = require('express-validator')

module.exports = {
    //Function to handle errors, is passed 'templateFunction' and an optional 'dataCb'. Will return 'req, res, next'
    handleErrors(templateFunction, dataCb){
        return async (req,res,next) => {
            const errors = validationResult(req)

            // If errors occur, return the 'templateFunction' with an object containing the errors
            if(!errors.isEmpty()){

                // Define variable 'data'
                let data = {}
                // Check if 'dataCb' exists
                if(dataCb){
                    // Call 'dataCb()', pass in the 'request' object and update the 'data' value to the result
                   data = await dataCb(req)
                }

                // Return the 'template' to user with any errors and merge the value of 'data' to errors
                return res.send(templateFunction({ errors, ...data }))
            }

            // If no errors, call the next function
            next()
        }
    },
    // Function to make sure users are signed in with valid account to access admin pages
    requireAuth(req,res,next){
        // Check if userId is defined and user is signed in
        if (!req.session.userId){
            // If user is not signed in, redirect them to signin page
            return res.redirect('/signin');
        }
        // If user is signed in, call next function
        next();
    }
}