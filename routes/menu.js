const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {Menu} = require('../models/menu');
const { validateMenuRules, validateMenuUpdateRules, validate } = require('../middleware/validate.js');

/**
 * @swagger
 *
 * definitions:
 *   Menu:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       description:
 *         type: string
 *       category:
 *         type: string
 *       price:
 *         type: string
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
 *   response:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       data:
 *         $ref: '#/definitions/Menu'
 */

/**
 * @swagger
 *
 * /menu:
 *   get:
 *     tags: [menu]
 *     description: Get entire Menu
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Menu list
 *         schema:
 *           $ref: '#/definitions/response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.get('/', async (req, res) => {
    const menu = await Menu.find();
	res.status(200).json({
		status: 200,
		data: menu
	});
});

/**
 * @swagger
 *
 * /menu/:id:
 *   get:
 *     tags: [menu]
 *     description: Get single Menu item
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Menu list
 *         schema:
 *           $ref: '#/definitions/response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.get('/:id', async (req, res) => {
    const menu = await Menu.find({_id: req.params.id});
	res.status(200).json({
		status: 200,
		data: menu
	});
});

/**
 * @swagger
 *
 * /menu:
 *   post:
 *     tags: [menu]
 *     description: Add new menu position
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
 *       - name: Menu
 *         description: Menu position data
 *         in:  body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Menu'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.post('/', auth, validateMenuRules(), validate, async (req, res) => {
    const menu = new Menu(req.body);
	await menu.save((err)=>{
		if(!err) {
			res.status(201).json({
				status: 201, 
				message: "MENU_SAVED"
			});
		} else {
			res.status(503).json({
				status: 503, 
				errors: [
					{
						param: "system",
						message: 'SYSTEM_ERROR'
					}
				]
			});
		}
	});
});

/**
 * @swagger
 *
 * /menu/:id:
 *   patch:
 *     tags: [menu]
 *     description: Edit menu position
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
 *       - name: Menu
 *         description: Menu position data
 *         in:  body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Menu'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.patch('/:id', auth, validateMenuUpdateRules(), validate, async (req, res) => {
	const menu = await Menu.find({_id: req.params.id});
	if (!menu) return res.status(400).json({
		status: 400, 
		errors: [
			{
				param: "menu",
				message:'WRONG_ID'
			}
		]
	});
	else {
		Menu.findByIdAndUpdate(req.params.id, req.body, (err) =>{
			if(!err) {
				res.status(200).json({
					status: 200, 
					message:"MENU_UPDATED"
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
});


/**
 * @swagger
 *
 * /menu/:id:
 *   delete:
 *     tags: [menu]
 *     description: Delete menu position
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
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.delete('/:id', auth, async (req, res) => {
	Menu.deleteOne({_id: req.params.id}, (err) =>{
		if(!err) {
			res.status(200).json({
				status: 200, 
				message:"DELETED"
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