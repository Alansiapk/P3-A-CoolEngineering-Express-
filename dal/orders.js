const {Order, OrderStatus, OrderItem, User} = require('../models')

//
const createOrder = async (orderData) => {
    const order = new Order (orderData);
    await order.save();

    return order;
}

//
const createOrderItem = async (orderItemData) => {
    const orderItem = new OrderItem (orderItemData)
    await orderItem.save();

    return orderItem;
}
//
const getOrderByStripeId = async (stripeId) => {
    const order = await Order.where({
        "stripe_id": stripeId
    }).fetch({
        require: true
    });
    return order;
}

const getAllOrders = async () => {
    const orders = await Order.collection().fetch({
        require: false,
        withRelated: ['user', 'orderStatus', 'orderItems']
    })
    return orders;
}


const getAllStatuses = async () => {
    const order_statuses = await OrderStatus.fetchAll().map((order_status) => {
        return [order_status.get('id'), order_status.get('order_status')];
    });
    order_statuses.unshift([0, '---Select One---']);
    return order_statuses;
}

const getOrderById = async (orderId) => {
    return await Order.where({
        id: orderId
    }).fetch({
        require:false,
        withRelated:['user', 'orderStatus']
    })
}

const getOrderItemsByOrderId = async (orderId) => {
    return await OrderItem.where({
        order_id: orderId
    }).fetchAll({
        require: false,
        withRelated: ['product', 'product.category', 'product.brand']
    })
}

const getOrdersByUserId = async (userId) => {
    return await Order.where({
        user_id: userId
    }).fetchAll({
        require: false,
        withRelated: ['orderStatus']
    })
}

const updateStatus = async (orderId, newStatusId) => {
    const order = await getOrderById(orderId);
    order.set('order_status_id', newStatusId);
    await order.save();
    return order;
}

const deleteOrder = async (orderId) => {
    const order = await getOrderById(orderId);
    await order.destroy();
}
async function getAllOrderStatus(){
    const allOrderStatus = await OrderStatus.fetchAll().map((status) => {
        return [status.get('id'), status.get('order_status')]
    })
    return allOrderStatus;
}

module.exports = {
    createOrder,
    createOrderItem,
    getAllOrders,
    getAllStatuses,
    getOrderById,
    getOrderItemsByOrderId,
    getOrdersByUserId,
    updateStatus,
    deleteOrder,
    getOrderByStripeId,
    getAllOrderStatus
}