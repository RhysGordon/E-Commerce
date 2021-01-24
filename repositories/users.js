const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository')

const scrypt = util.promisify(crypto.scrypt);

// Copying methods from 'Repository' class
class UsersRepository extends Repository {
	async create(attributes) {
		// Assigns new property 'ID' and sets value of 'randomId()'
		attributes.id = this.randomId();

		// Generate 'Salt'
		const salt = crypto.randomBytes(8).toString('hex');

		// Generate hash password using 'Salt' and 'password' provided in 'attributes'
		const hashed = await scrypt(attributes.password, salt, 64);

		// Load file to ensure we have the most recent version of data
		const records = await this.getAll();

		// Call 'attributes' - Replace 'password' value and saved as 'record'.
		const record = {
			// Replace the default 'password' inside of 'attributes'
			...attributes,
			password: `${hashed.toString('hex')}.${salt}`
		};
		// Push in the new user
		records.push(record);

		await this.writeAll(records);

		return record;
	}
	// Compare stored password with password supplied by the user on log-in
	async comparePasswords(saved, supplied) {
		// Saved Password is the password saved in the database. Format is 'hashed.salt'

		// Supplied password is the password given to us by the user trying to sign in

		// Extract 'hashed' and 'salt' from the 'saved' password and split them into separate values
		const [ hashed, salt ] = saved.split('.');

		// Take password supplied by the user, 'hash' it and add the 'salt'. 'hashedSupplied' is a 'buffer'
		const hashedSupplied = await scrypt(supplied, salt, 64);

		// Compare the passwords and return 'true' or 'false'. Converts 'hashedSupplied' to a string
		return hashed === hashedSupplied.toString('hex')
	}
}

// Allows other files in the project access to this code
module.exports = new UsersRepository('users.json');
