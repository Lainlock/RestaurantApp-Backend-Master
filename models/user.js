const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const uuid = require('node-uuid');

const userSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
	},
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({
		_id: this._id,
		email: this.email,
	}, config.get('jwtPrivateKey'), {
		expiresIn: config.get('tokenLifetime')
	});
	return token;
};

const User = mongoose.model('User', userSchema);


exports.userSchema = userSchema;
exports.User = User;