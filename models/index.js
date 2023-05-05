const bookshelf = require('../bookshelf')

//a bookshelf model represent one table in database 
//one model, one table, one database 


const Product = bookshelf.model('Product', {
    tableName: 'products',
    category() {
        return this.belongsTo('Category')
    },
    brand() {
        return this.belongsTo('Brand')
    },
    application() {
        return this.belongsTo('Application')
    },
    tags() {
        return this.belongsToMany('Tag');
    }
});

const Tag = bookshelf.model('Tag', {
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const Category = bookshelf.model('Category', {
    tableName: 'categories',
    products() {
        return this.hasMany('Product', 'category_id');
    }
})

const Brand = bookshelf.model('Brand', {
    tableName: 'brands',
    products() {
        return this.hasMany('Product', 'brand_id');
    }
})

const Application = bookshelf.model('Application', {
    tableName: 'applications',
    products() {
        return this.hasMany('Product', 'application_id');
    }
})

const User = bookshelf.model('User', {
    tableName: 'users',
    role() {
        return this.belongsTo("Role")
    },
    orders() {
        return this.hasMany('Order')
    }

})

const Role = bookshelf.model('Role', {
    tableName: 'roles',
    users() {
        return this.hasMany('User', 'role_id');
    }
})

const BlacklistedToken = bookshelf.model('BlacklistedToken', {
    tableName: 'blacklisted_tokens'
})
const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    product() {
        return this.belongsTo('Product')
    }
})

const OrderItem = bookshelf.model('OrderItem', {
    tableName: 'orders_items',
    product() {
        return this.belongsTo('Product')
    },
    order() {
        return this.belongsTo('Order')
    },
    
})


const Order = bookshelf.model("Order", {
    tableName: "orders",
    user() {
        return this.belongsTo("User");
    },
    orderStatus() {
        return this.belongsTo("OrderStatus");
    },
    orderItems() {
        return this.hasMany('OrderItem');
    },
});

const OrderStatus = bookshelf.model("OrderStatus", {
    tableName: "order_statuses",
    orders() {
        return this.hasMany('Order', 'order_id');
    }
})

module.exports = { Product, Category, Brand, Application, Tag, User, CartItem, Role, BlacklistedToken, Order, OrderStatus, OrderItem };
