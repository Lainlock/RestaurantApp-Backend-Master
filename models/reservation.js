const mongoose = require('mongoose');
const uuid = require('node-uuid');

const reservationSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4
    },
	date: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    table: {
        type: String, 
        ref: 'table'
    }
});


const Reservation = mongoose.model('reservation', reservationSchema);

exports.reservationSchema = reservationSchema;
exports.Reservation = Reservation;