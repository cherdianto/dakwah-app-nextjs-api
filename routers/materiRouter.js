const express = require('express')
const { showContent, updateContent, addContent, deleteContent } = require('../controllers/contentController')
const { addMateri, showMateri, showAllMateri, updateMateri, deleteMateri } = require('../controllers/materiController')
const verifyToken = require('../middlewares/verifyToken')
const router = express.Router()

// MATERI MANAGEMENT
router.get('/', showAllMateri)
router.get('/:materiid', showMateri)
router.post('/add', addMateri)
router.put('/update/:materiid', updateMateri)
router.delete('/delete/:materiid', deleteMateri)

// CONTENT MANAGEMENT
// router.get('/:materiid/content', verifyToken, showContent)
router.put('/:materiid/content/:contentid', verifyToken, updateContent)
router.post('/:materiid/content', verifyToken, addContent)
router.delete('/:materiid/content/:contentid', verifyToken, deleteContent)

module.exports = router