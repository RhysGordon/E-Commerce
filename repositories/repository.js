const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository {
    constructor(filename) {
		// Checks if a filename was provided, if not, throws an error
		if (!filename) {
			throw new Error('Creating a repository requires a filename');
		}

		// Takes the filename and stores as an instance variable
		this.filename = filename;

		// Checks if this file exists
		try {
			fs.accessSync(this.filename);

			// If the file doesn't exist, this will create the file
		} catch (error) {
			fs.writeFileSync(this.filename, '[]');
		}
	}

    // Create new record
    async create(attributes) {
        // Assign a random ID to attributes
        attributes.id = this.randomId()

        // Get all records
        const records = await this.getAll()

        // Add the new record 
        records.push(attributes)

        // 
        await this.writeAll(records)

        // Return the updated attributes value
        return attributes
    }


	// Get a list of all users
	async getAll() {
		// Open the file, parse the contents and return the parsed data
		return JSON.parse(await fs.promises.readFile(this.filename, { encoding: 'utf8' }));
	}


	async writeAll(records) {
		// Write the updated 'records' array back to this.filename
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
	}

	randomId() {
		// Assigns a random id specified by number of 'bytes' - Then converts to string of 'hex' value
		return crypto.randomBytes(4).toString('hex');
	}

	async getOne(id) {
		// Get 'records'
		const records = await this.getAll();
		// Find the record with matching 'ID'
		return records.find((record) => record.id === id);
	}

	async delete(id) {
		// Get 'records'
		const records = await this.getAll();

		// Iterate through each record and filter out any with ID that is passed in
		const filteredRecords = records.filter((record) => record.id !== id);

		// Update 'records' using new 'filteredRecords'
		await this.writeAll(filteredRecords);
	}

	async update(id, attributes) {
		// Get 'records'
		const records = await this.getAll();

		// Get the 'record' required
		const record = records.find((record) => record.id === id);

		// Checks if this record exists, if not, throw an error
		if (!record) {
			throw new Error(`Record with ID of ${id} not found!`);
		}

		//Update the record found - Adding 'attributes' to 'record'
		Object.assign(record, attributes);

		// Take all records and write them back to json file
		await this.writeAll(records);
	}

	async getOneBy(filters) {
		// Get 'records'
		const records = await this.getAll();

		// Iterate through 'records'
		for (let record of records) {
			// Declare temporary variable 'found' initalized as 'true'
			let found = true;

			// Iterate over 'filters' object, look at every key value pair and compare to key in 'record' object
			for (let key in filters) {
				if (record[key] !== filters[key]) {
					found = false;
				}
			}

			if (found) {
				return record;
			}
		}
	}
}