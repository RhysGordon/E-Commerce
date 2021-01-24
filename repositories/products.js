// Require in Repository class
const Repository = require('./repository')

// Create ProductsRepository - extends Repository 
class ProductsRepository extends Repository {

}

// Create an instance of 'ProductsRepository' and export it
module.exports = new ProductsRepository('products.json')