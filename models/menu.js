const mongoose = require('mongoose');
const uuid = require('node-uuid');

const menuSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});


const Menu = mongoose.model('menu', menuSchema);

exports.menuSchema = menuSchema;
exports.Menu = Menu;