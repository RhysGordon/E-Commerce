// Require in the 'express' library
const express = require('express');
const carts = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const cartsRepo = require('../repositories/carts');

// Create a new router with 'express'
const router = express.Router();

// Receive POST request to add an item to a cart
router.post('/cart/products', async (req,res) => {
    // Figure out the cart (create new cart or receive the users cart from repository)
    let cart
    if(!req.session.cartId){
        // Create a new cart with default value of empty array
        cart = await cartsRepo.create({ items: [] });
        // Store cart id on req.session.cartId property
        req.session.cartId = cart.id;

    } else {
        // Get the cart from repository
        cart = await cartsRepo.getOne(req.session.cartId);

    }

    // Use 'find' helper and iterate over each item. Return first item that matches 'req.body.productId' property
    const existingItem = cart.items.find(item => item.id === req.body.productId);
    if(existingItem){
        // increment quantity and save cart
        existingItem.quantity++;

    } else {
        // add new product id to items array 
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    // update 'cartsRepo' - 'cart.id' will be updated - 'items' array will be updated to contain 'cart.items'
    await cartsRepo.update(cart.id, { items: cart.items });

    res.redirect('/cart');
})

// Receive GET request to show all items in cart
router.get('/cart', async (req,res) => {
    // Check if user has a cart already assigned to them
    if(!req.session.cartId){
        // If no cart is assigned, redirect back
        return res.redirect('/')
    }

    // If user has a cart, retreive from cartsRepo and save as 'cart'
    const cart = await cartsRepo.getOne(req.session.cartId);
    // Iterate over each 'item' in cart
    for (let item of cart.items){
        // Save the product using 'getOne()' on productsRepo using the 'item.id'
        const product = await productsRepo.getOne(item.id);
        // Take product that was found and assign to item property
        item.product = product;
    }

    res.send(cartShowTemplate({items: cart.items }));
});

// Receive POST request to delete an item from a cart
router.post('/cart/products/delete', async (req,res) => {
    // Extract 'itemId' from req.body
    const { itemId } = req.body;
    // Retrieve the 'cart' from the repository
    const cart = await cartsRepo.getOne(req.session.cartId);
    // Filter 'cart.items' - return 'true' if value of 'item' is not equal to 'itemId'. If 'true' - Keep in new 'items' array
    const items = cart.items.filter(item => item.id !== itemId);
    // Update cart
    await cartsRepo.update(req.session.cartId, { items });

    // Redirect user back to main 'cart' page
    res.redirect('/cart');
});

// Export as 'router'
module.exports = router;