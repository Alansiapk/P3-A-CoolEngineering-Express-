const express = require('express');
const router = express.Router();
const { getOrdersByUserId } = require('../../dal/orders');

// router.get('/:user_id', async (req, res) => {
//     try {
//         const orders = await getOrdersByUserId(req.params.user_id);
//         res.json(orders);
//     } catch (e) {
//         res.send(e)
//     }
// })

router.get('/', async (req, res) => {
    try {
        const orders = await getOrdersByUserId(req.user.id);
        res.json(orders);
    } catch (e) {
        res.send(e)
    }
})



module.exports = router