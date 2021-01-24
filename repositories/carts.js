// Require in the 'Repository' class
const Repository = require('./repository')

// Create new 'CartsRepository' class and pull in methods from 'Repository'
class CartsRepository extends Repository {}

// Export new 'CartsRepository' and create the default file 'carts.json'
module.exports = new CartsRepository('carts.json')