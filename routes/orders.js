const express = require('express');
const router = express.Router();

const { bootstrapField, createOrderSearchForm, 
    createOrderStatusForm } = require('../forms');

const {createOrder,createOrderItem,getAllOrders,getAllStatuses,getOrderById,
    getOrderItemsByOrderId,
    getOrdersByUserId,
    updateStatus,
    deleteOrder,
} = require('../dal/orders');

const { Order, OrderItem } = require('../models');
const async = require('hbs/lib/async');

router.get("/", async (req, res) => {

    const orders = await getAllOrders();



    res.render("orders/index", {
        orders: orders.toJSON()
    })
})

router.get('/:order_id/items', async (req, res) => {
    const order = await getOrderById(req.params.order_id);
    const orderItems = await getOrderItemsByOrderId(req.params.order_id);

    const orderStatusForm = createOrderStatusForm(await getAllStatuses() );
    orderStatusForm.fields.status_id.value = order.get('status_id');
    res.render('orders/order-items', {
        order: order.toJSON(),
        orderItems: orderItems.toJSON(),
        form: orderStatusForm.toHTML(bootstrapField)
    })
})

router.post('/:order_id/update', async (req, res) => {
    await updateStatus(req.params.order_id, req.body.order_status_id);
    req.flash('success messages', 'Order status updated');
    res.redirect(`/orders/${req.params.order_id}/items`)
})

module.exports = router;