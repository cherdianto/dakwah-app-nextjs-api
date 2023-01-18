const express = require('express')
const { addMateri, showMateri, showAllMateri, updateMateri, deleteMateri } = require('../controllers/materiController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

router.get('/', showAllMateri)
router.get('/:materiid', showMateri)
router.post('/add', addMateri)
router.put('/update/:materiid', updateMateri)
router.delete('/delete/:materiid', deleteMateri)

module.exports = router