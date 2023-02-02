import express from 'express'
import { showContent, updateContent, addContent, deleteContent } from '../controllers/contentController.js'
import { addMateri, showMateri, showAllMateri, updateMateri, deleteMateri } from '../controllers/materiController.js'
import allowedRole from '../middlewares/rbacMiddleware.js'
import verifyToken from '../middlewares/verifyToken.js'
const router = express.Router()

// MATERI MANAGEMENT
router.get('/', showAllMateri)
router.get('/:materiid', showMateri)
router.post('/add', verifyToken, allowedRole(['administrator', 'editor']), addMateri)
router.put('/update/:materiid',verifyToken, allowedRole(['administrator', 'editor']), updateMateri)
router.delete('/delete/:materiid',verifyToken, allowedRole(['administrator']), deleteMateri)

// CONTENT MANAGEMENT
// router.get('/:materiid/content', verifyToken, showContent)
router.put('/:materiid/content/:contentid', verifyToken, allowedRole(['administrator', 'editor']), updateContent)
router.post('/:materiid/content', verifyToken, allowedRole(['administrator', 'editor']), addContent)
router.delete('/:materiid/content/:contentid',verifyToken, allowedRole(['administrator']),verifyToken, deleteContent)

export default router