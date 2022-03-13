const mongoose = require('mongoose');
const uuid = require('node-uuid');

const tableSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4
    },
    number: {
        type: Number,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    coordinates: {
        x: {
            type: Number,
        },
        y: {
            type: Number,
        }  
    }
});


const Table = mongoose.model('table', tableSchema);

exports.tableSchema = tableSchema;
exports.Table = Table;