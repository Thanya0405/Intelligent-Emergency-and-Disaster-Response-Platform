const express = require('express');
const router = express.Router();
const { getFamily, addMember, updateMember, updateMemberStatus, deleteMember } = require('../controllers/familyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFamily);
router.post('/', protect, addMember);
router.put('/:id', protect, updateMember);
router.put('/:id/status', protect, updateMemberStatus);
router.delete('/:id', protect, deleteMember);

module.exports = router;
