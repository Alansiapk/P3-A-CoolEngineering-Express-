const express = require('express');
const router = express.Router();

const { bootstrapField, createOrderSearchForm,
    createOrderStatusForm, updateOrderStatusForm } = require('../forms');

const { createOrder, createOrderItem, getAllOrders, getAllStatuses, getOrderById,
    getOrderItemsByOrderId,
    getOrdersByUserId,
    updateStatus,
    deleteOrder,
} = require('../dal/orders');

const { Order, OrderItem } = require('../models');
const async = require('hbs/lib/async')
const OrderServices = require('../services/order_services')

router.get("/", async (req, res) => {

    const orders = await getAllOrders();



    res.render("orders/index", {
        orders: orders.toJSON()
    })
})

// router.get('/:order_id/items', async (req, res) => {
//     const order = await getOrderById(req.params.order_id);
//     const orderItems = await getOrderItemsByOrderId(req.params.order_id);

//     const orderStatusForm = createOrderStatusForm(await getAllStatuses() );
//     orderStatusForm.fields.status_id.value = order.get('status_id');
//     res.render('orders/order-items', {
//         order: order.toJSON(),
//         orderItems: orderItems.toJSON(),
//         form: orderStatusForm.toHTML(bootstrapField)
//     })
// })

// to a update you need 2 RESTFUL response 

router.get('/:order_id/update', async (req, res) => {
    try {
        // 1. get all the order id;
        // 2. get particular id that user want to update 
        // 3. pass in the id value to get that order row of information in db
        // 4. update the information 
        const orders = await getAllOrders();
        const status = await new OrderServices().getAllOrderStatus();
        //will it be an object?
        //const editOrder = await getOrderItemsByOrderId(req.params.order_id);
        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.order_id);

        //extract selected order_status_id from order table
        let extractStatus = orderRes.get('order_status_id')

        //create the form
        const form = updateOrderStatusForm(status);
        //update the form values
        form.fields.order_status_id.value = extractStatus;
        res.render('orders/update', {
            'orders': orderRes.toJSON(),
            'form': form.toHTML(bootstrapField)
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error"
        })
        console.log("Error in line 71 order.js", e);
    }
})

router.post('/:order_id/update', async (req, res) => {

    try {
        const status = await new OrderServices().getAllOrderStatus();
        let orderObj = new OrderServices();
        let orderRes = await orderObj.getOrderById(req.params.order_id);
        const form = updateOrderStatusForm(status);
        form.handle(req, {
            'success': async (form) => {
                //need to take note
                orderRes.set("order_status_id", form.data.order_status_id); //(form.data.status === "1" ? "complete " : ((form.data.status === "2") ? "incomplete" : "delievered"))
                orderRes.save();
                res.redirect('/orders');
            },
            'error': async (form) => {
                res.render('orders/update', {
                    'orders': orderRes.toJSON(),
                    'form': form.toHTML(bootstrapField)
                })
            }
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error"
        })
        console.log("Error in line 103 order.js", e);
    }

    // await updateStatus(req.params.order_id, req.body.order_status_id);
    // req.flash('success messages', 'Order status updated');
    // res.redirect(`/orders/${req.params.order_id}/items`)
})

module.exports = router;