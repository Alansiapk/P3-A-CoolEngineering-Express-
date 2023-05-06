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

router.get('/', async (req,res) =>{
const orderSearchForm = createOrderSearchForm(await getAllStatuses());
    let searchQuery = Order.collection();
    orderSearchForm.handle(req,{
        empty: async(form) => {
            const orders = await searchQuery.fetch({
                withRelated:['user', 'orderStatus', 'orderItems']
            })
        }
    })

})