const express = require("express");
const cartController = require("../controllers/cart.js");
const { verify, verifyAdmin } = require("../auth.js");

const router = express.Router();

router.get("/get-cart", verify, cartController.getCart);

//[SECTION] Route for Add To Cart
router.post("/add-to-cart", verify, cartController.addToCart);

//[SECTION] Route for Change Product Quantities in Cart
router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);

router.patch("/:productId/remove-from-cart", verify, cartController.removeFromCart);

router.put("/clear-cart", verify, cartController.clearCart);


module.exports = router;