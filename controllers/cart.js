const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const bcrypt = require("bcryptjs");
const { createAccessToken, errorHandler } = require("../auth.js")

module.exports.getCart = (req, res) => {
	return Cart.findOne({userId: req.user.id})
	.then(result => {
		if(!result) {
			return res.status(404).json({error: "User's cart cannot be found"});
		}

		return res.status(200).json({cart: result});
	})
	.catch(err => errorHandler(err, req, res));
};

// Controller function to Add To Cart
module.exports.addToCart = async (req, res) => {
	try {
	    const userId = req.user.id; // Retrieved from JWT
	    const { productId, quantity, subtotal } = req.body;

	    // Validate that the product exists in the database
	    const product = await Product.findById(productId);
	    if (!product) {
	    	return res.status(404).json({ message: "Product not found." });
	    }

	    let cart = await Cart.findOne({ userId });

	    if (!cart) {
	      	// Create a new cart if none exists
	    	cart = new Cart({
	    		userId,
	    		cartItems: [{ productId, quantity, subtotal }],
	    		totalPrice: subtotal,
	    	});
	    } else {
	      	// Check if the product already exists in the cart
	    	const productIndex = cart.cartItems.findIndex((item) => item.productId === productId);

	    	if (productIndex >= 0) {
	        	// Update existing product quantity and subtotal
	    		const item = cart.cartItems[productIndex];
	    		item.quantity += quantity;
	    		item.subtotal += subtotal;
	    	} else {
	        	// Add new product to cart
	    		cart.cartItems.push({ productId, quantity, subtotal });
	    	}

	      	// Update total price
	    	cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
	    }

	    await cart.save();
	    return res.status(200).json({
	    	message: "Item added to cart successfully",
	    	cart: cart
	    });
	} catch (error) {
		return res.status(500).json({
			message: "Error adding to cart",
			error: error.message
		});
	}
};

// addToCart alternative
// module.exports.addToCart = (req, res) => {
// 	return Cart.findOne({userId: req.user.id})
// 	.then(result => {
// 		if(!result) {
// 			const newCart = new Cart({
// 				userId: req.user.id,
// 				cartItems: req.body,
// 				totalPrice: req.body.subtotal
// 			});

// 			return newCart.save()
// 			.then(result => {
// 				return res.status(200).json({
// 					message: "Item added to cart successfully",
// 					cart: result
// 				});
// 			})
// 			.catch (err => errorHandler(err, req, res));
// 		} else {
// 			const index = result.cartItems.findIndex(item => item.productId === req.body.productId);

// 			if(index >= 0) {
// 				result.cartItems[index].quantity += req.body.quantity;
// 				result.cartItems[index].subtotal += req.body.subtotal;
// 			} else {
// 				result.cartItems.push({
// 					productId: req.body.productId,
// 					quantity: req.body.quantity,
// 					subtotal: req.body.subtotal
// 				});
// 			}

// 			result.totalPrice += req.body.subtotal;

// 			return result.save()
// 			.then(result2 => {
// 				return res.status(200).json({
// 					message: "Item added to cart successfully",
// 					cart: result2
// 				});
// 			})
// 			.catch (err => errorHandler(err, req, res));
// 		}
// 	})
// 	.catch (err => errorHandler(err, req, res));
// };

// Controller function to Change Product Quantities in Cart
module.exports.updateCartQuantity = async (req, res) => {
	try {
	    const userId = req.user.id; // Retrieved from JWT
	    const { productId, newQuantity } = req.body;

	    const cart = await Cart.findOne({ userId });

	    if (!cart) {
	    	return res.status(404).json({ message: "Cart not found for this user." });
	    }

	    // Find product in cart
	    const productIndex = cart.cartItems.findIndex((item) => item.productId === productId);

	    if (productIndex >= 0) {
	      	// Update quantity and subtotal
	    	const item = cart.cartItems[productIndex];
	      	item.subtotal = (item.subtotal / item.quantity) * newQuantity; // Recalculate subtotal
	      	item.quantity = newQuantity;

	      	// Update total price
	      	cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

	      	await cart.save();
	      	return res.status(200).json({
	      		message: "Item quantity updated successfully",
	      		updatedcart: cart
	      	});
		} else {
		  	return res.status(404).json({ message: "Item not found in cart." });
		}
	} catch (error) {
		return res.status(500).json({
			message: "Error updating cart quantity",
			error: error.message
		});
	}
};

module.exports.removeFromCart = (req, res) => {
	return Cart.findOne({userId: req.user.id})
	.then(result => {
		if(!result) {
			return res.status(404).json({message: "Cart does not exist"});
		} else {
			const index = result.cartItems.findIndex(item => item.productId === req.params.productId);

			if(index >= 0) {
				const removedItem = result.cartItems.filter(item => item.productId === req.params.productId);

				result.cartItems.splice(index, 1);

				result.totalPrice -= removedItem[0].subtotal;
			} else {
				return res.status(404).json({message: "Item not found in cart"});
			}
		}

		return result.save()
		.then(result => {
			return res.status(200).json({
				message: "Item removed from cart successfully",
				updatedCart: result
			})
		})
		.catch(err => errorHandler(err, req, res));
	})
	.catch(err => errorHandler(err, req, res));
};

module.exports.clearCart = (req, res) => {
	return Cart.findOne({userId: req.user.id})
	.then(result => {
		if(!result) {
			return res.status(404).json({message: "Cart does not exist"});
		} else {
			if(result.cartItems.length > 0) {
				result.cartItems.splice(0, result.cartItems.length);

				result.totalPrice = 0;
			} else {
				return res.status(400).json({message: "Cart is already empty"});
			}
		}

		return result.save()
		.then(result => {
			return res.status(200).json({
				message: "Cart cleared successfully",
				cart: result
			})
		})
		.catch(err => errorHandler(err, req, res));
	})
	.catch(err => errorHandler(err, req, res));
};