const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
require("dotenv").config();
const csrf = require('csurf');
const cors = require("cors");


// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(cors());

// set up sessions
app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}))

app.use(flash())


// enable CSRF
// app.use(csrf());
// note: replaced app.use(csrf()) with the following:
const csurfInstance = csrf();
app.use(function(req,res,next){
  console.log("checking for csrf exclusion")
  // exclude whatever url we want from CSRF protection
  if (req.url == "/checkout/process_payment"|| req.url.slice(0,5)=="/api/") {
    return next();
  }
  csurfInstance(req,res,next);
})


app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
      req.flash('error_messages', 'The form has expired. Please try again');
      res.redirect('back');
  } else {
      next()
  }
});


// Register Flash middleware
app.use(function (req, res, next) {
  res.locals.date = new Date();
    next();
});

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// Share CSRF with hbs files
app.use(function(req,res,next){
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
}
  next();
})


// import in routes
const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/products.js');
const userRoutes = require('./routes/users.js');
const cloudinaryRoutes = require('./routes/cloudinary.js');
const cartRoutes = require('./routes/shoppingCart.js');
const checkoutRoutes = require("./routes/checkout.js");
const orderRoutes = require("./routes/orders.js")
const api = {
  products: require('./routes/api/products.js'),
  users: require('./routes/api/users.js'),
  cart: require('./routes/api/cart.js'),
  orders: require('./routes/api/orders.js'),
  checkout: require('./routes/api/checkout.js')
}


async function main() {
    app.use('/', landingRoutes);

    app.use('/products', productRoutes);

    app.use('/users', userRoutes);

    app.use('/cloudinary', cloudinaryRoutes);

    app.use('/shoppingCart', cartRoutes);

    app.use("/checkout", checkoutRoutes);
    
    app.use("/orders", orderRoutes);

    app.use('/api/products', express.json(), api.products);
    
    app.use('/api/users', express.json(), api.users);

    app.use('/api/cart', express.json(), api.cart);

    app.use('/api/orders', express.json(), api.orders);

    app.use('/api/checkout', express.json(), api.checkout);

}

main();

app.listen(3000, () => {
  console.log("Server has started");
});
