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

    console.log(orders.toJSON())

    res.render("orders/index", {
        orders: orders.toJSON()
    })
})


module.exports = router;