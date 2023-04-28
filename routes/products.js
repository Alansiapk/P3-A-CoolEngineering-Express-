const express = require('express');
const router = express.Router();

// #1 import in the Product model
const { Product, Category, Brand, Application, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');


router.get('/', async (req, res) => {

  
    // #2 - fetch all the products (ie, SELECT * from products)
    let products = await Product.collection().fetch({
        withRelated: ['category', 'brand', 'application', 'tags']
    });

    //from hbs
    res.render('products/index', {
        'products': products.toJSON() // #3 - convert collection to JSON
     
    })

})

router.get('/create', async (req, res) => {

    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const allBrands = await Brand.fetchAll().map((brand) => {
        return [brand.get('id'), brand.get('name')];
    })

    const allApplications = await Application.fetchAll().map((application) => {
        return [application.get('id'), application.get('name')];
    })

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(allCategories, allBrands, allApplications, allTags);
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const allBrands = await Brand.fetchAll().map((brand) => {
        return [brand.get('id'), brand.get('name')];
    })

    const allApplications = await Application.fetchAll().map((application) => {
        return [application.get('id'), application.get('name')];
    })
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
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
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    // fetch all the tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    // fetch all the categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const allBrands = await Brand.fetchAll().map((brand) => {
        return [brand.get('id'), brand.get('name')];
    })

    const allApplications = await Application.fetchAll().map((application) => {
        return [application.get('id'), application.get('name')];
    })

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

    // fill in the multi-select for the tags
    let selectedTags = await product.related('tags').pluck('id');
    productForm.fields.tags.value = selectedTags;


    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async (req, res) => {

    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const allBrands = await Brand.fetchAll().map((brand) => {
        return [brand.get('id'), brand.get('name')];
    })

    const allApplications = await Application.fetchAll().map((application) => {
        return [application.get('id'), application.get('name')];
    })

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    });
    // process the form
    const productForm = createProductForm(allCategories, allBrands, allApplications);

    productForm.handle(req, {
        'success': async (form) => {
            let { tags, ...productData } = form.data;
            product.set(form.data); //overwrite the original data
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
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'product': product.toJSON()
    })

});

router.post('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    await product.destroy();
    res.redirect('/products')
})



module.exports = router;
