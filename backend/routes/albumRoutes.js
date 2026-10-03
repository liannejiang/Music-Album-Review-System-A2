
const express = require('express');
const { createAlbum, getAlbum, updateAlbum, deleteAlbum, listAlbums } = require('../controllers/albumController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/albums', protect, listAlbums);
router.get('/albums/:id', protect, getAlbum);

router.post('/admin/albums', protect, requireRole('admin'), createAlbum);
router.get('/admin/albums/:id', protect, requireRole('admin'), getAlbum);
router.put('/admin/albums/:id', protect, requireRole('admin'), updateAlbum);
router.delete('/admin/albums/:id', protect, requireRole('admin'), deleteAlbum);

module.exports = router;
