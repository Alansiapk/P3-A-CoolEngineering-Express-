const express = require('express');
const router = express.Router();

// #1 import in the Product model
const { Product, Category, Brand, Application, Tag } = require('../models');
const { createProductForm, bootstrapField, createSearchForm } = require('../forms');
// import in the DAL
const dataLayer = require('../dal/products')


router.get('/', async (req, res) => {
    const allCategories = await dataLayer.getAllCategories();
    allCategories.unshift([0, '----']);

    const allBrands = await dataLayer.getAllBrands();
    allBrands.unshift([0, '----']);

    const allApplications = await dataLayer.getAllApplications();
    allApplications.unshift([0, '----']);

    const allTags = await dataLayer.getAllTags();
    
    const searchForm = createSearchForm(allCategories, allBrands, allApplications, allTags);
    let q = Product.collection();
    searchForm.handle(req, {
        'empty': async (form) => {

            let products = await q.fetch({
                withRelated: ['category', 'brand', 'application', 'tags']
            })
            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })

        },
        'error': async (form) => {
            //q execute the query
            let products = await q.fetch({
                withRelated: ['category', 'brand', 'application', 'tags']
            })
            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {
            if (form.data.name) {
                // add in: AND WHERE name LIKE '%<somename>%'
                q.where('name', 'LIKE', '%' + form.data.name + '%');
            }

            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost);
            }

            if (form.data.max_cost) {
                q.where('cost', '<=', form.data.max_cost);
            }

            if (form.data.category_id && form.data.category_id != "0") {
                q.where('category_id', '=', form.data.category_id);
            }

            if (form.data.brand_id && form.data.brand_id != "0") {
                q.where('brand_id', '=', form.data.brand_id);
            }

            if (form.data.application_id && form.data.application_id != "0") {
                q.where('application_id', '=', form.data.application_id);
            }

            if (form.data.tags) {
                // JOIN products_tags ON products.id = products_tags.product_id
                q.query('join', 'products_tags', 'products.id', 'product_id')
                  .where('tag_id', 'in', form.data.tags.split(','))
            }

            let products = await q.fetch({
                'withRelated':['category', 'brand', 'application', 'tags']
            });

            res.render('products/index',{
                products: products.toJSON(),
                form: form.toHTML(bootstrapField)
            })
        }
    })

})

router.get('/create', async (req, res) => {

    const allCategories = await dataLayer.getAllCategories();

    const allBrands = await dataLayer.getAllBrands();

    const allApplications = await dataLayer.getAllApplications();

    const allTags = await dataLayer.getAllTags();

    const productForm = createProductForm(allCategories, allBrands, allApplications, allTags);
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })

})


router.post('/create', async (req, res) => {
    const allCategories = await dataLayer.getAllCategories();

    const allBrands = await dataLayer.getAllBrands();

    const allApplications = await dataLayer.getAllApplications();

    const allTags = await dataLayer.getAllTags();

    const productForm = createProductForm(allCategories, allBrands, allApplications, allTags);

    productForm.handle(req, {
        'success': async (form) => {
            // separate out tags from the other product data
            // as not to cause an error when we createP
            // the new product
            let { tags, ...productData } = form.data;
            //spread and destructuring
            const product = new Product(productData); //one row of table

            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description);
            // product.set('warranty', form.data.warranty);
            // product.set('indoor_unit', form.data.indoor_unit);
            // product.set('outdoor_unit', form.data.outdoor_unit);
            // product.set('date_created', form.data.date_created);
            // product.set('category_id', form.data.category_id);
            // product.set('brand_id', form.data.brand_id);
            // product.set('application_id', form.data.application_id);
            await product.save();
            // save the many to many relationship
            if (tags) {
                await product.tags().attach(tags.split(","));
            }
            req.flash("success_messages", `New Product ${product.get('name')} has been created`)
            res.redirect('/products');
        },
        'empty': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async (req, res) => {
    // retrieve the product
    const productId = req.params.product_id
    const product = await dataLayer.getProductByID(productId);

    const allCategories = await dataLayer.getAllCategories();

    const allBrands = await dataLayer.getAllBrands();

    const allApplications = await dataLayer.getAllApplications();

    const allTags = await dataLayer.getAllTags();
    
    const productForm = createProductForm(allCategories, allBrands, allApplications, allTags);

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.warranty.value = product.get('warranty');
    productForm.fields.indoor_unit.value = product.get('indoor_unit');
    productForm.fields.outdoor_unit.value = product.get('outdoor_unit');
    productForm.fields.category_id.value = product.get('category_id');
    productForm.fields.brand_id.value = product.get('brand_id');
    productForm.fields.application_id.value = product.get('application_id');
    // productForm.fields.date_created.value = product.get('date_created');
    // 1 - set the image url in the product form
    productForm.fields.image_url.value = product.get('image_url');

    // fill in the multi-select for the tags
    let selectedTags = await product.related('tags').pluck('id');
    productForm.fields.tags.value = selectedTags;


    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON(),
        // 2 - send to the HBS file the cloudinary information
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })

})

router.post('/:product_id/update', async (req, res) => {


    const allCategories = await dataLayer.getAllCategories();

    const allBrands = await dataLayer.getAllBrands();

    const allApplications = await dataLayer.getAllApplications();

    const allTags = await dataLayer.getAllTags();

    // fetch the product that we want to update
    const productId = req.params.product_id
    const product = await dataLayer.getProductByID(productId);
    // process the form
    const productForm = createProductForm(allCategories, allBrands, allApplications, allTags);

    productForm.handle(req, {
        'success': async (form) => {
            let { tags, ...productData } = form.data;
            product.set(productData); //overwrite the original data
            product.save();

            // update the tags
            let tagIds = tags.split(',');
            let existingTagIds = await product.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false);
            await product.tags().detach(toRemove);

            // add in all the tags selected in the form
            await product.tags().attach(tagIds);

            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })

})

router.get('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const productId = req.params.product_id
    const product = await dataLayer.getProductByID(productId);

    res.render('products/delete', {
        'product': product.toJSON()
    })

});

router.post('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const productId = req.params.product_id
    const product = await dataLayer.getProductByID(productId);
    await product.destroy();
    res.redirect('/products')
})



module.exports = router;
