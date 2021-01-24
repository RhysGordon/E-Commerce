// Require in from external libraries
const express = require('express')
const multer = require('multer')

// Require in files authored by us
const { handleErrors, requireAuth } = require('./middlewares')
const productsRepo = require('../../repositories/products')
const productsNewTemplate = require('../../views/admin/products/new')
const productsIndexTemplate = require('../../views/admin/products/index')
const productsEditTemplate = require('../../views/admin/products/edit')
const { requireTitle, requirePrice } = require('./validators')

const router = express.Router()
const upload = multer({storage: multer.memoryStorage()})

// Route handler to list all products to administrator
router.get('/admin/products', requireAuth, async (req, res)=>{
    // Retrieve all 'products' using 'getAll()' on 'productsRepo'
    const products = await productsRepo.getAll();
    // Call 'productsIndexTemplate', pass in object with all 'products' and send back to whoever made request
    res.send(productsIndexTemplate({ products }));

})

// Route handler to allow administrator to create new products
router.get('/admin/products/new', requireAuth, (req,res)=>{
    res.send(productsNewTemplate({}))
})

// Route handler to handle admin adding new product to the page
router.post('/admin/products/new', requireAuth, upload.single('image'), [requireTitle,requirePrice], handleErrors(productsNewTemplate) ,async (req,res)=>{
    // Save the uploaded image as a 'base64' string
    const image = req.file.buffer.toString('base64')
    // Extract 'title' and 'price' from 'req.body'
    const {title,price} = req.body
    // Create new product inside of 'productsRepo' 
    await productsRepo.create({title,price,image})

    // Send the user to the /admin/products page
    res.redirect('/admin/products')
})

// Route handler to handle product edit
router.get('/admin/products/:id/edit', requireAuth, async (req,res)=>{
    // Retrieve the product using the 'id' property
    const product = await productsRepo.getOne(req.params.id);

    // If no product is found with the ID given, inform the user
    if(!product){
        return res.send('Product not found!');
    }

    // Send the productsEditTemplate to the user
    res.send(productsEditTemplate({ product }));
})

// Route handler to handle submission of 'edit' form for product
router.post('/admin/products/:id/edit', 
  requireAuth, 
  upload.single('image'), 
  [requireTitle, requirePrice], 
  handleErrors(productsEditTemplate, async (req) => {
      const product = await productsRepo.getOne(req.params.id);
      return { product };
  }),
  async (req,res) => {
    // Apply any changes made to title, price and image to the product in productsRepo

    // Assign 'req.body' to 'changes'
    const changes = req.body

    // Check if a file was uploaded. If it was, update 'changes.image' to this new image
    if (req.file) {
        changes.image = req.file.buffer.toString('base64')
    }

    // Update the product in productsRepo if no errors occur
    try {
      await productsRepo.update(req.params.id, changes)

    // If an error occurred - send error to user
    } catch (error) {
        return res.send('Could not find item')
    }

    res.redirect('/admin/products')
})

// Route handler to handle deleting products
router.post('/admin/products/:id/delete', requireAuth, async (req,res) => {
    // Execute the delete method on productsRepo using the ID value
    await productsRepo.delete(req.params.id)

    // Redirect the user back to the products page after deleting the product
    res.redirect('/admin/products')
})

module.exports = router;