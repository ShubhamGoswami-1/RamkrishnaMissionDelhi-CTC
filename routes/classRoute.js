const express = require('express');

const classController = require('./../controllers/classController');

const router = express.Router();

router.post('/add-new-class', classController);

module.exports = router;