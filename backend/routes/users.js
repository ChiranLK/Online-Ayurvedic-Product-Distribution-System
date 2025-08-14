const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  approveSeller
} = require('../controllers/users');

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/approve', approveSeller);

module.exports = router;
