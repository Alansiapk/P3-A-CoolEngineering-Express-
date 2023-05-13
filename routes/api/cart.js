const express = require("express");
const router = express.Router();
const CartServices = require('../../services/cart_services');

 
router.get('/:user_id', async (req, res) => {
    const cartServices = new CartServices(req.params.user_id);
    const cart = await cartServices.getCart()
    res.json(cart)
})
   
  
router.post('/:product_id/add', async (req, res) => {
    console.log('adding to cart ==================')
    //let userId = req.user.id;
    let userId = req.body.user_id;
   // console.log('test user',req.user.id)
    const cartServices = new CartServices(userId)
 
    let addProductsToCart = await cartServices.addToCart(req.params.product_id, req.body.quantity);
    if (addProductsToCart) {
        res.json({
            "success": "item added"
        });
    } else {
        res.status(400);
        res.json({
            "fail": "failed to add"
        })
    }  
})

router.post('/:product_id/delete', async (req, res) => {
    // let userId = req.user.id;
    let userId = req.body.user_id;
    let productId = req.params.product_id
    const cartServices = new CartServices(userId)
    await cartServices.remove(productId)
    res.json({
        'success': 'cart item deleted'
    })
})
   
router.post('/:product_id/update', async (req, res) => {
    console.log('update started')

     //let userId = req.user.id;
     let userId = req.body.user_id;
     
     let productId = req.params.product_id;
     let quantity = parseInt(req.body.quantity);
     const cartServices = new CartServices(userId)
     
    let updateCartItem = await cartServices.setQuantity(productId, quantity);
    if (updateCartItem) {
        res.json({
            'success': 'quantity updated'
        })
    } else {
        res.json({
            'error': 'quantity not updated'
        })
    }
})

module.exports = router;
