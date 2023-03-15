const router = require('express').Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    addFriend,
    removeFriend,
} = require('../../controllers/userController.js');

// /api/users
router
    .route('/')
    // GET all users
    .get(getAllUsers)
    // POST to create a new user
    .post(createUser);

// /api/users/:id
router
    .route('/:id')
    // GET a single user by its _id and populated thought and friend data
    .get(getUserById)
    // PUT to update a user by its _id
    .put(updateUser)
    // DELETE to remove user by its _id and associated thoughts
    .delete(deleteUser);

// /api/users/:userId/friends/:friendId
router
    .route('/:userId/friends/:friendId')
    // POST to add a new friend to a user's friend list
    .post(addFriend)
    // DELETE to remove a friend from a user's friend list
    .delete(removeFriend);

module.exports = router;
