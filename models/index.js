const bookshelf = require('../bookshelf')

//a bookshelf model represent one table in database 
//one model, one table, one database 


const Product = bookshelf.model('Product', {
    tableName:'products',
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

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const Category = bookshelf.model('Category',{
    tableName: 'categories',
    products() {
        return this.hasMany('Product', 'category_id');
    }
})

const Brand = bookshelf.model('Brand',{
    tableName: 'brands',
    products() {
        return this.hasMany('Product', 'brand_id');
    }
})

const Application = bookshelf.model('Application',{
    tableName: 'applications',
    products() {
        return this.hasMany('Product', 'application_id');
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    product() {
        return this.belongsTo('Product')
    }

})



module.exports = { Product, Category, Brand, Application, Tag, User, CartItem };
