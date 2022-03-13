const { check, validationResult } = require('express-validator');

exports.validateLoginRules = () => {
	return [
		check('email').not().isEmpty().withMessage("required").isEmail().withMessage("email"),
		check('password').not().isEmpty().withMessage("required").isLength({min: 4}).withMessage("minLength").isLength({max: 32}).withMessage("maxLength")
	]
}

exports.validateMenuRules = () => {
	return [
		check('name').not().isEmpty().withMessage("required"),
        check('category').not().isEmpty().withMessage("required"),
        check('description').not().isEmpty().withMessage("required"),
        check('price').not().isEmpty().withMessage("required")
	]
}

exports.validateMenuUpdateRules = () => {
	return [
		check('name').optional().not().isEmpty().withMessage("empty"),
        check('category').optional().not().isEmpty().withMessage("empty"),
        check('description').optional().not().isEmpty().withMessage("empty"),
        check('price').optional().not().isEmpty().withMessage("empty")
	]
}

exports.validateReservationRules = () => {
	return [
		check('name').not().isEmpty().withMessage("required"),
        check('surname').not().isEmpty().withMessage("required"),
        check('email').not().isEmpty().withMessage("required").isEmail().withMessage("email"),
        check('table').not().isEmpty().withMessage("required"),
        check('date').not().isEmpty().withMessage("required")
	]
}

exports.validateTableRules = () => {
	return [
		check('size').not().isEmpty().withMessage("required").isNumeric().withMessage("NaN"),
        check('number').not().isEmpty().withMessage("required").isNumeric().withMessage("NaN"),
	]
}

exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      	return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({
        param: err.param, 
        message: err.msg 
    }))
  
    return res.status(422).json({
		status: 422,
      	errors: extractedErrors,
    })
}