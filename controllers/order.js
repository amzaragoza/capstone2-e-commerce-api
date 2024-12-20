const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const bcrypt = require("bcryptjs");
const { createAccessToken, errorHandler } = require("../auth.js")

module.exports.checkout = (req, res) => {
	return Cart.findOne({userId: req.user.id})
	.then(result => {
		if(!result) {
			return res.status(404).json({error: "User's cart cannot be found"});
		} else {
			if(result.cartItems.length > 0) {
				let newOrder = new Order({
					userId: req.user.id,
					productsOrdered: result.cartItems,
					totalPrice: result.totalPrice
				});

				result.cartItems.splice(0, result.cartItems.length);
				result.totalPrice = 0;
				result.save();

				return newOrder.save()
				.then(result => res.status(201).json({
					message: "Ordered Successfully",
					productsOrdered: result
				}))
				.catch(err => errorHandler(err, req, res));
			} else {
				return res.status(400).json({error: "No Items to Checkout"});
			}
		}
	})
	.catch(err => errorHandler(err, req, res));
};

// checkout alternative
// module.exports.checkout = async (req, res) => {
// 	try {
// 		const cart = await Cart.findOne({userId: req.user.id});
// 		let order;

// 		if(!cart) {
// 			return res.status(404).json({error: "User's cart cannot be found"});
// 		} else {
// 			if(cart.cartItems.length > 0) {
// 				order = new Order({
// 					userId: req.user.id,
// 					productsOrdered: cart.cartItems,
// 					totalPrice: cart.totalPrice
// 				});
// 			} else {
// 				return res.status(400).json({error: "No Items to Checkout"});
// 			}

// 			return order.save()
// 			.then(result => res.status(201).json({message: "Ordered Successfully"}))
// 			.catch(err => errorHandler(err, req, res));
// 		}
// 	} catch (err) {
// 		return errorHandler(err, req, res);
// 	}
// };

module.exports.getMyOrders = (req, res) => {
	return Order.find({userId: req.user.id})
	.then(result => {
		if(!result) {
			return res.status(404).json({error: "User's orders cannot be found"});
		} else {	
			return res.status(200).json({orders: result});
		}
	})
	.catch(err => errorHandler(err, req, res));
};

// Controller function to Retrieve all user's orders (Admin only)
module.exports.getAllOrders = (req, res) => {
	return Order.find({})
	.then(result => {
		if(!result) {
			return res.status(404).json({error: "No orders found"});
		} else {	
			return res.status(200).json({orders: result});
		}
	})
	.catch(err => errorHandler(err, req, res));
};
