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


module.exports = router;
