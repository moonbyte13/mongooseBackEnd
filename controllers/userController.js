const { User, Thought, Reaction } = require('../models');

module.exports = {
    // Get all students
    async getAllUsers(req, res) {
        try {
            const users = await User.find()
                .populate('thoughts')
                .populate('friends');
            res.json(users);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    // Get a single student
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id)
                .populate('thoughts')
                .populate('friends');
            res.json(user);
        } catch (err) {
            console.log(err.message);
            res.status(500).json(err.message);
        }
    },

    // Create a new student
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);
            res.json(user);
        } catch (err) {
            console.log(err);
            res.status(500).json(err.message);
        }
    },

    // Update a user
    async updateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            res.json(user);
        } catch (err) {
            console.log(err.message);
            res.status(500).json(err.message);
        }
    },

    // Delete a user and associated thoughts
    async deleteUser(req, res) {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);

            if (!deletedUser) {
                return res
                    .status(404)
                    .json({ message: 'No user found with this id!' });
            }

            await Thought.deleteMany({ username: deletedUser.username });

            res.json({ message: 'User and associated thoughts deleted!' });
        } catch (err) {
            console.log(err.message);
            res.status(500).json(err.message);
        }
    },

    // Add a friend to a user's friend list
    async addFriend(req, res) {
        try {
            const currentUser = await User.findById(req.params.userId);
            const friendToAdd = await User.findById(req.params.friendId);
            if (!currentUser || !friendToAdd) {
                return res
                    .status(404)
                    .json({ message: 'User or friend not found' });
            }
            if (currentUser.friends.includes(friendToAdd._id)) {
                return res
                    .status(400)
                    .json({
                        message: 'User is already friends with this person',
                    });
            }
            currentUser.friends.push(friendToAdd._id);
            await currentUser.save();
            res.json(currentUser);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Remove a friend from a user's friend list
    async removeFriend(req, res) {
        try {
            const currentUser = await User.findById(req.params.userId);
            const friendToRemove = await User.findById(req.params.friendId);
            if (!currentUser || !friendToRemove) {
                return res
                    .status(404)
                    .json({ message: 'User or friend not found' });
            }
            if (!currentUser.friends.includes(friendToRemove._id)) {
                return res
                    .status(400)
                    .json({ message: 'User is not friends with this person' });
            }
            currentUser.friends = currentUser.friends.filter(
                (friendId) =>
                    friendId.toString() !== friendToRemove._id.toString()
            );
            await currentUser.save();
            res.json(currentUser);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};
