const express = require("express");
const router = express.Router();
const CartServices = require('../../services/cart_services');

router.get('/:user_id', async (req, res) => {
    const cartServices = new CartServices(req.params.user_id);
    const cart = await cartServices.getCart()
    console.log(req.session.user.id)
    res.json(cart)
})

router.post('/:product_id/add', async (req, res) => {
    const cartServices = new CartServices(req.session.user.id)

    let addProductsToCart = await cartServices.addToCart(req.params.product_id, 1);
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
    let userId = req.user.id;
    let productId = req.params.product_id
    await CartServices.remove(userId, productId)
    res.json({
        'success': 'cart item deleted'
    })
})

router.post('/:product_id/update', async (req, res) => {
    console.log('update started')
    let userId = req.user.id;
    let productId = req.params.product_id;
    let quantity = parseInt(req.body.quantity);

    let updateCartItem = await CartServices.setQuantity(userId, productId, quantity);
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
