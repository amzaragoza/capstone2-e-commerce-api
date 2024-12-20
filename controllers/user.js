const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const { createAccessToken, errorHandler } = require("../auth.js")

module.exports.registerUser = (req, res) => {
	let newUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 10),
		mobileNo: req.body.mobileNo
	})

	if(!newUser.email.includes("@")) {
		return res.status(400).send({error: "Email invalid"})
	}
	if(typeof req.body.mobileNo !== "string" || req.body.mobileNo.length !== 11) {
		return res.status(400).send({error: "Mobile number invalid"})
	}
	if(req.body.password.length < 8) {
		return res.status(400).send({error: "Password must be atleast 8 characters"})
	}

	return newUser.save()
	.then(result => res.status(201).send({message: "Registered Successfully"}))
	.catch(err => errorHandler(err, req, res))
};

module.exports.loginUser = (req, res) => {
	if(req.body.email.includes("@")) {
		return User.findOne({email: req.body.email})
		.then(result => {
			if(result === null || result.length < 0) {
				return res.status(404).send({error: 'No email found'});
			} else {
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				if(isPasswordCorrect) {
					return res.status(200).send({access: createAccessToken(result)});
				} else {
					return res.status(401).send({error: 'Email and password do not match'});
				}
			}
		})
		.catch(err => errorHandler(err, req, res));
	} else {
		return res.status(400).send({error: 'Invalid Email'});
	}
};

// Controller function to retrieve user details
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(404).send({ error: 'User not found' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));
};


// Controller function to update a user to admin
module.exports.updateUserAsAdmin = async (req, res) => {

    try {
        // Find user by ID
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not Found' });
        }

        // Update user to admin
        user.isAdmin = true;
        await user.save();

        return res.status(200).json({ updatedUser: user });
    } catch (error) {
        console.error('Error updating user to admin:', error);
        return res.status(500).json({
        	error: 'Failed in Find',
        	details: error
        });
    }
};


// Controller function to update the password
module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(201).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};