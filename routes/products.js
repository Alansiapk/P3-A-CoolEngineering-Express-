const express = require('express');
const router = express.Router();

// #1 import in the Product model
const {Product, Category} = require('../models');
const { createProductForm, bootstrapField } = require('../forms');


router.get('/', async(req,res)=>{
        // #2 - fetch all the products (ie, SELECT * from products)
        let products = await Product.collection().fetch({
            withRelated:['category']
        });
    

        //from hbs
        res.render('products/index', {
            'products': products.toJSON() // #3 - convert collection to JSON
        })
    
})

router.get('/create', async(req,res)=>{

    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })
    const productForm = createProductForm(allCategories);
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const productForm = createProductForm(allCategories);
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product(); //one row of table
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('warranty', form.data.warranty);
            product.set('indoor_unit', form.data.indoor_unit);
            product.set('outdoor_unit', form.data.outdoor_unit);
            product.set('date_created', form.data.date_created);
            await product.save();
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
        require: true
    });
// fetch all the categories
const allCategories = await Category.fetchAll().map((category)=>{
    return [category.get('id'), category.get('name')];
})

    const productForm = createProductForm(allCategories);

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.warranty.value = product.get('warranty');
    productForm.fields.indoor_unit.value = product.get('indoor_unit');
    productForm.fields.outdoor_unit.value = product.get('outdoor_unit');
    productForm.fields.category_id.value = product.get('category_id');
    // productForm.fields.date_created.value = product.get('date_created');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async (req, res) => {

    const allCategories = await Category.fetchAll().map((category)=>{
        return [category.get('id'), category.get('name')];
    })

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    // process the form
    const productForm = createProductForm(allCategories);

    productForm.handle(req, {
        'success': async (form) => {
            product.set(form.data); //overwrite the original data
            product.save();
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

router.get('/:product_id/delete', async(req,res)=>{
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

router.post('/:product_id/delete', async(req,res)=>{
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
