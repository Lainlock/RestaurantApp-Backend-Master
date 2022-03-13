const config = require('config');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {Table} = require("../models/table");
const { validateTableRules, validate } = require('../middleware/validate.js');

/**
 * @swagger
 *
 * definitions:
 *   Table:
 *     type: object
 *     required:
 *       - size
 *       - number
 *     properties:
 *       number:
 *         type: number
 *       size:
 *         type: number
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
 *         $ref: '#/definitions/Table'
 */

 /**
 * @swagger
 *
 * /tables:
 *   get:
 *     tags: [tables]
 *     description: Get all tables
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
 *         description: Table list
 *         schema:
 *           $ref: '#/definitions/Response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.get('/', async (req, res) => {
    const tables = await Table.find();
	res.status(200).json({
		status: 200,
		data: tables
	});
});

 /**
 * @swagger
 *
 * /tables:
 *   post:
 *     tags: [tables]
 *     description: Add new table
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Admin's JWT
 *         description: JWT
 *         in:  header
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/token'
 *       - name: Reservation
 *         description: Table data
 *         in:  body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Table'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.post('/', auth, validateTableRules(), validate, async (req, res) => {
    let table = new Table(req.body);
    await table.save((err)=>{
        if(!err) {
            res.status(201).json({
                status: 201, 
                message: "TABLE_SAVED"
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

 /**
 * @swagger
 *
 * /tables/:id:
 *   delete:
 *     tags: [tables]
 *     description: Delete table
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Admin's JWT
 *         description: JWT
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
    await Table.findByIdAndDelete(req.params.id, (err)=>{
        if(!err) {
            res.status(201).json({
                status: 200, 
                message: "TABLE_DELETED"
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