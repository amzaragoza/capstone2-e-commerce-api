const Product = require("../models/Product.js");
const bcrypt = require("bcryptjs");
const { createAccessToken, errorHandler } = require("../auth.js")

module.exports.addProduct = (req, res) => {
	let newProduct = new Product({
		name: req.body.name,
		description: req.body.description,
		price: req.body.price
	});

	return Product.findOne({name: req.body.name})
	.then(existingProduct => {
		if(existingProduct) {
			return res.status(409).json({error: "Product already exists"});
		} else {
			return newProduct.save()
			.then(result => res.status(201).json(result))
			.catch(err => errorHandler(err, req, res));
		}
	})
	.catch(err => errorHandler(err, req, res));
};

module.exports.getAllProducts = (req, res) => {
	return Product.find({})
	.then(result => {
		if(result.length <= 0) {
			return res.status(404).json({error: "No products found"});
		}
		
		return res.status(200).json(result)
	})
	.catch(err => errorHandler(err, req, res))
};

module.exports.getAllActiveProducts = (req, res) => {
	return Product.find({isActive: true})
	.then(result => {
		if(result.length > 0) {
			return res.status(200).json(result);
		} else {
			return res.status(404).json({error: "No active products found"});
		}
	})
	.catch(err => errorHandler(err, req, res));
};

module.exports.getProduct = (req, res) => {
	return Product.findById(req.params.productId)
    .then(result => {
    	if(!result){
    		return res.status(404).json({error: "Product not found"});
    	}

    	return res.status(200).json(result);
    })
	.catch(err => errorHandler(err, req, res));
};

// Controller function to update a Product information (Admin only)
module.exports.updateProduct = (req, res)=>{

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    // updatedProduct - the updates to be made in the document
    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
            res.status(200).send({
            	success: true,
            	message : 'Product updated successfully'
            });
        } else {
            res.status(404).send({error : 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};


// Controller function to Archive Product (Admin only)
module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    };

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
            // Check if a product was found
        if (product) {
                // If product found, check if it was already archived
            if (!product.isActive) {
                    // If product already archived
                return res.status(200).json({
                   message: 'Product already archived',
                   archivedProduct: product
               });
            }
                // If product not yet archived
            return res.status(200).json({
               success: true,
               message: 'Product archived successfully'
           });
        } else {
                // If product not found
            return res.status(404).send({
               error: 'Product not found'
           });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


// Controller function to Activate Product (Admin only)
module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
            // Check if a product was found
        if (product) {
                // If product found, check if it was already activated
            if (product.isActive) {
                    // If product already activated
                return res.status(200).json({
                   message: 'Product already active',
                   activateProduct: product
               });
            }
                // If product not yet activated
            return res.status(200).json({
               success: true,
               message: 'Product activated successfully'
           });
        } else {
                // If product not found
            return res.status(404).send({
               error: 'Product not found'
           });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Controller function to Add search for products by their names
module.exports.searchProductsByName = async (req, res) => {
    try {
        const { name } = req.body; //product name

        const products = await Product.find({
            name: { $regex: name, $options: "i" } // Case-insensitive search
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Error searching products", error: err.message });
    }
};


// Controller function to Add search for products by price range
module.exports.searchProductsByPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        /*
            Option 1: Strict Numeric Input
                If the input must be strictly numbers:
        */
        // Explicitly check that minPrice and maxPrice are numbers
        if (typeof minPrice !== 'number' || typeof maxPrice !== 'number') {
            return res.status(400).json({ message: 'Price range values must be numbers' });
        }

        /*
            Option 2: Flexible Input (Allow Strings That Represent Numbers)
                If you want to accept strings like "123":
        
        // Ensure minPrice and maxPrice are numbers
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (isNaN(min) || isNaN(max)) {
            return res.status(400).json({ message: 'Invalid price range provided' });
        }
        */

        // Find products within the price range
        const products = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found in this price range" });
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Error searching products", error: err.message });
    }
};
