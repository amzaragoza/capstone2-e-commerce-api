const express = require("express");
const orderController = require("../controllers/order.js");
const { verify, verifyAdmin } = require("../auth.js");

const router = express.Router();

router.post("/checkout", verify, orderController.checkout);

router.get("/my-orders", verify, orderController.getMyOrders);

router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);






module.exports = router;