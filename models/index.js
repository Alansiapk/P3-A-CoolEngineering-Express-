const bookshelf = require('../bookshelf')

//a bookshelf model represent one table in database 
//one model, one table, one database 


const Product = bookshelf.model('Product', {
    tableName:'products',
    category() {
        return this.belongsTo('Category')
    }
});

const Category = bookshelf.model('Category',{
    tableName: 'categories',
    products() {
        return this.hasMany('Product', 'category_id');
    }
})


module.exports = { Product, Category };
