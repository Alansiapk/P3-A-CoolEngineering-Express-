const express = require('express');
const router = express.Router();
const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const orderDataLayer = require("../dal/orders.js");
const moment = require("moment");
moment().format();



router.get('/', async (req, res) => {
    const cart = new CartServices(req.session.user.id);

    // get all the items from the cart
    
    let items = await cart.getCart();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let i of items) {
       const lineItem = {
            'quantity': i.get('quantity'),
            'price_data': {
                'currency':'SGD',
                'unit_amount': (i.related('product').get('cost')) * 100,
                'product_data':{
                    'name': i.related('product').get('name'),  
                }
            }
   
        }
        if (i.related('product').get('image_url')) {
             lineItem.price_data.product_data.images = [ i.related('product').get('image_url')];
        }
        lineItems.push(lineItem);
        // save the quantity data along with the product id
        meta.push({
            'user_id': req.session.user.id,
            'product_id' : i.get('product_id'),
            'quantity': i.get('quantity')
        })
    }

    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card', 'grabpay'],
        mode:'payment',
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        },
        shipping_address_collection: {
            allowed_countries: ["SG"]
        },
        billing_address_collection: "required",
    }

    // step 3: register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment)
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })

})

router.post('/process_payment', express.raw({type: 'application/json'}), async (req, res) => {
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
    } catch (e) {
        res.send({
            'error': e.message
        })
        console.log(e.message)
    }

    console.log(event)
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;

        console.log("stripeSession:", stripeSession);
        // process stripeSession 



        const paymentIntent = await Stripe.paymentIntents.retrieve(stripeSession.payment_intent);
        const metadataToJson = JSON.parse(stripeSession.metadata.orders);
        const userId = metadataToJson[0].user_id;
        const date = moment.unix(stripeSession.created).format("YYYY-MM-DD HH:mm:ss");

        const orderData = {
            user_id: userId,
            order_status_id: 2,
            payment_type: paymentIntent.payment_method_types[0],
            total_cost: stripeSession.amount_total,
            order_date: date ,
            shipping_country: stripeSession.shipping_details.address.country,
            shipping_postal: stripeSession.shipping_details.address.postal_code,
            shipping_address_line_1: stripeSession.shipping_details.address.line1,
            shipping_address_line_2: stripeSession.shipping_details.address.line2,
            billing_country: stripeSession.customer_details.address.country,
            billing_postal: stripeSession.customer_details.address.postal,
            billing_address_line_1: stripeSession.customer_details.address.line1,
            billing_address_line_2: stripeSession.customer_details.address.line2,
            stripe_id: stripeSession.id
        }

        const createOrder = await orderDataLayer.createOrder(orderData);

        const orderDetails = await orderDataLayer.getOrderByStripeId(stripeSession.id);
        
        metadataToJson.forEach(order => {
            const newItem = orderDataLayer.createOrderItem({
                "quantity": order.quantity,
                "product_id": order.product_id,
                "order_id": orderDetails.id
            })
        })


    }
    res.send({ received: true });
})



module.exports = router;
