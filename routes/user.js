const express = require("express");
const userController = require("../controllers/user.js");
const { verify, verifyAdmin } = require("../auth.js");

const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

//[Section] Route for retrieving user details
router.get("/details",verify, userController.getProfile)

//[Section] Route for updating user as admin
router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.updateUserAsAdmin);

//[Section] Route for updating password
router.patch('/update-password', verify, userController.updatePassword);


module.exports = router;