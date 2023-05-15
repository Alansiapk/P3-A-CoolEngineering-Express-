const express = require('express')
const router = express.Router();
const{ Product } = require ('../../models');
const{ createProductForm} = require ('../../forms')

const productDataLayer = require('../../dal/products')

router.get('/', async(req,res)=>{
    res.send(await productDataLayer.getAllProducts())
})

router.get('/detail/:product_id', async(req,res)=>{
    let productId = req.params.product_id;
    res.send(await productDataLayer.getProductByID(productId))
} )

router.get("/brands", async (req, res) => {
    res.send(await productDataLayer.getAllBrands())
})

router.get("/applications", async (req, res) => {
    res.send(await productDataLayer.getAllApplications())
})

router.get("/categories", async (req, res) => {
    res.send(await productDataLayer.getAllCategories())
})

router.get("/tags", async (req, res) => {
    res.send(await productDataLayer.getAllTags())
})

router.post('/', async (req, res) => {
    const allCategories = await productDataLayer.getAllCategories();
    const allTags = await productDataLayer.getAllTags();
    const productForm = createProductForm(allCategories, allTags);

    productForm.handle(req, {
        'success': async (form) => {                    
            let { tags, ...productData } = form.data;
            const product = new Product(productData);
            await product.save();
    
            // save the many to many relationship
            if (tags) {
                await product.tags().attach(tags.split(","));
            }
            res.send(product);
        },
        'error': async (form) => {
           let errors = {};
           for (let key in form.fields) {
               if (form.fields[key].error) {
                   errors[key] = form.fields[key].error;
               }
           }
           res.send(JSON.stringify(errors));
        }
    })

})

router.post('/search', async (req, res) => {
    console.log("what is inside req ", req); 
    const q = Product.collection();

    if (Object.keys(req.body).length === 0) {
        const products = await q.fetch({
            withRelated: ['application', 'brand', 'category', 'tags']
        })
        res.send(products)
    }
    else if (Object.keys(req.body).length != 0) {
        console.log("what is name ", req.body.name);
        if (req.body.name) {
            q.where('name', 'like', '%' + req.body.name + '%')
        }
        if (req.body.min_cost) {
            q.where('cost', '>=', req.body.min_cost)
        }
        if (req.body.max_cost) {
            q.where('cost', '<=', req.body.max_cost)
        }
        if (req.body.application_id) {
            q.where('application_id', '=', req.body.application_id)
        }
        if (req.body.category_id) {
            q.where('category_id', '=', req.body.category_id)
        }
        if (req.body.brand_id) {
            q.where('brand_id', '=', req.body.brand_id)
        }
        if (req.body.tags) {
            console.log("this is body tags ", req.body.tags.toString().split(','));
            q.query('join', 'products_tags', 'products.id', 'product_id')
            .where('tag_id', 'in', req.body.tags.toString().split(','))
        }
        const products = await q.fetch({
            withRelated: ['application', 'brand', 'category', 'tags',]
        })
        res.send(products);
    }
    
})



module.exports = router;
