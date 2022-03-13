const config = require('config');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const {Reservation} = require("../models/reservation");
const {Table} = require("../models/table");
const { validateReservationRules, validate } = require('../middleware/validate.js');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: config.get('email'),
	  pass: config.get('password')
	}
});
transporter.use('compile', hbs({
	viewEngine: {
		partialsDir: './src/',
		extName: '.handlebars',
		layoutsDir: './src/',
	},
	viewPath: './src/',
	extName: '.handlebars'
}));

/**
 * @swagger
 *
 * definitions:
 *   NewReservation:
 *     type: object
 *     required:
 *       - email
 *       - name
 *       - surname
 *       - table
 *       - date
 *     properties:
 *       email:
 *         type: string
 *         format: email
 *       name:
 *         type: string
 *       surname:
 *         type: string
 *       table:
 *         type: string
 *       date:
 *         type: string
 *         format: date
 *   Reservation:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         format: email
 *       name:
 *         type: string
 *       surname:
 *         type: string
 *       table:
 *         type: string
 *       date:
 *         type: string
 *         format: date
 *   UserReservation:
 *     type: object
 *     properties:
 *       table:
 *         type: string
 *       date:
 *         type: string
 *         format: date
 *   token:
 *     type: object
 *     properties:
 *       x-auth-token:
 *         type: string
 *   error:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       errors:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             param:
 *               type: string
 *             message: 
 *               type: string
 *   Response:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       data:
 *         $ref: '#/definitions/Reservation'
 *   UserResponse:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       data:
 *         $ref: '#/definitions/UserReservation'
 */

 /**
 * @swagger
 *
 * /reservations:
 *   get:
 *     tags: [reservations]
 *     description: Get all reservation dates and tables for normal user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Reserved dates and tables
 *         schema:
 *           $ref: '#/definitions/UserResponse'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/', async (req, res) => {
    const reservations = await Reservation.find({ date: { $gte: Date.now() } }).select("date table")
	res.status(200).json({
		status: 200,
		data: reservations
	});
});

 /**
 * @swagger
 *
 * /reservations/all:
 *   get:
 *     tags: [reservations]
 *     description: Get all reservations for admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: x-auth-token
 *         description: Admin's JWT
 *         in:  header
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/token'
 *     responses:
 *       200:
 *         description: Reservations list
 *         schema:
 *           $ref: '#/definitions/Response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/all', auth, async (req, res) => {
    const reservations = await Reservation.find();
	res.status(200).json({
		status: 200,
		data: reservations
	});
});

 /**
 * @swagger
 *
 * /reservations:
 *   post:
 *     tags: [reservations]
 *     description: Add new reservation
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Reservation
 *         description: Reservation data
 *         in:  body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Reservation'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.post('/', validateReservationRules(), validate, async (req, res) => {
	let checkDate = new Date(req.body.date);
	if(checkDate < Date.now()) {
		return res.status(400).json({
			status: 400, 
			errors: [
				{
					param: "date",
					message:'WRONG_DATE'
				}
			]
		});
	}
	const table = await Table.find({_id: req.body.table});
	if(!table) {
		res.status(400).json({
			status: 400, 
			errors: [
				{
					param: "table",
					message:'WRONG_TABLE'
				}
			]
		});
	} else {
		let lowerDate = new Date(req.body.date,);
		let upperDate = new Date(req.body.date);
		let time = parseInt(config.get('reservationTime'));
		lowerDate.setHours(lowerDate.getHours() - time);
		upperDate.setHours(upperDate.getHours() + time);
		const reservations = await Reservation.find({"date": {"$gte": lowerDate, "$lt": upperDate}, "table": req.body.table})
		if(reservations.length > 0) {
			res.status(400).json({
				status: 400, 
				errors: [
					{
						param: "table",
						message:"NOT_AVAILABLE",
					}
				]
			});
		} else {
			let reservation = new Reservation(req.body);
			await reservation.save(async (err)=>{
				if(!err) {
					let info = await transporter.sendMail({
						from: 'Restauracja "Pod Kleponczkiem"',
						to: req.body.email,
						subject: 'Potwierdzenie rezerwacji w restauracji "Pod Kleponczkiem"',
						template: 'main',
						context: {
							name: req.body.name,
							surname: req.body.surname,
							date: req.body.date,
							link: config.get('url') + reservation._id
						}
					});

					res.status(201).json({
						status: 201, 
						message: "RESERVATION_COMPLETE"
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
		}
	}
});

 /**
 * @swagger
 *
 * /reservations/:id:
 *   delete:
 *     tags: [reservations]
 *     description: Delete specified reservation
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.delete('/:id', async (req, res) => {
    Reservation.remove({ _id: req.params.id }, function(err) {
		if (!err) {
			res.status(200).json({
				status: 200,
				message: "DELETED"
			});
		}
		else {
			res.status(400).json({
				status: 400,
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