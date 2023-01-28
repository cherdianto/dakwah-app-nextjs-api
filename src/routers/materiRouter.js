import express from 'express'
import { showContent, updateContent, addContent, deleteContent } from '../controllers/contentController.js'
import { addMateri, showMateri, showAllMateri, updateMateri, deleteMateri } from '../controllers/materiController.js'
import verifyToken from '../middlewares/verifyToken.js'
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

export default router