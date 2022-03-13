const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {User} = require('../models/user');

router.post('/', async (req, res) => {
	let user = await User.findOne({
		email: req.body.email
	});
	if (user) return res.status(400).json({
		status: 400, 
		errors: [
			{
				param: "email",
				message:'EMAIL_TAKEN'
			}
		]
	});

	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save((err)=>{
		if(!err) {
			res.status(201).json({
				status: 201, 
				message: "USER_CREATED"
			});
		} else {
			res.status(503).json({
				status: 503, 
				errors: [
					{
						param: "system",
						message:'SYSTEM_ERROR'
					}
				]
			});
		}
	});

});

module.exports = router;