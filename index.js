const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");

mongoose.connect(process.env.MONGODB_STRING);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error!"));
db.once("open", () => console.log("Now connected to MongoDB Atlas."));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const corsOptions = {
    origin: ['http://localhost:3000', 'http://zuitt-bootcamp-prod-495-8257-abella.s3-website.us-east-1.amazonaws.com', 'http://zuitt-bootcamp-prod-495-8103-zaragoza.s3-website.us-east-1.amazonaws.com'],
    credentials: true,
    optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

app.use("/b3/users", userRoutes);
app.use("/b3/products", productRoutes);
app.use("/b3/cart", cartRoutes);
app.use("/b3/orders", orderRoutes);











if(require.main === module) {
	app.listen(process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${process.env.PORT || 3000}`);
	});
}

module.exports = { app, mongoose };