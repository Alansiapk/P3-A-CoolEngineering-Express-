// import in the Product model
const { Product, Category, Brand, Application, Tag } = require('../models');

const getAllCategories = async () => {
    return await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })
}

const getAllBrands = async () => {
    return await Brand.fetchAll().map((brand) => {
        return [brand.get('id'), brand.get('name')];
    })
}

const getAllApplications = async () => {
    return await Application.fetchAll().map((application) => {
        return [application.get('id'), application.get('name')];
    })
}
const getAllTags = async () => {
    return await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
}

const getProductByID = async (productId) => {
    return await Product.where({
        'id': parseInt(productId)
    }).fetch({
        require: true,
        withRelated: ['tags', 'category', 'brand', 'application']
    });
}

const getAllProducts = async () => {
    return await Product.fetchAll();
}

module.exports = {
    getAllCategories, getAllTags, getProductByID, getAllBrands, getAllApplications, getAllProducts
}

