const express = require("express");
const productController = require("../controllers/product.js");
const { verify, verifyAdmin } = require("../auth.js");

const router = express.Router();

router.post("/", verify, verifyAdmin, productController.addProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/active", productController.getAllActiveProducts);

router.get("/:productId", productController.getProduct);

//[SECTION] Route for updating a Product information (Admin only)
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

//[SECTION] Route for Archiving Product (Admin only)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

//[SECTION] Route for Activating Product (Admin only)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

//[SECTION] Route for Add search for products by their names
router.post("/search-by-name", productController.searchProductsByName);

//[SECTION] Route for  Add search for products by price range
router.post("/search-by-price", productController.searchProductsByPriceRange);

module.exports = router;