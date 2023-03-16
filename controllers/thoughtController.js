const { Thought, User, Reaction } = require('../models');

module.exports = {
    // Get all thoughts
    async getAllThoughts(req, res) {
        try {
            const thoughts = await Thought.find();
            res.json(thoughts);
        } catch (err) {
            res.status(500).json(err.message);
        }
    },

    // Get a single thought by its _id
    async getThoughtById(req, res) {
        try {
            const thought = await Thought.findById(req.params.thoughtId);
            res.json(thought);
        } catch (err) {
            res.status(500).json(err.message);
        }
    },

    // Create a new thought
    async createThought(req, res) {
        try {
            const thought = await Thought.create(req.body);
            console.log(thought._id);
            const updatedUser = await User.findOneAndUpdate(
                { username: thought.username },
                { $push: { thoughts: thought } },
                { new: true }
            );
            res.json(thought);
        } catch (err) {
            res.status(500).json(err.message);
        }
    },

    // PUT to update a thought by its _id
    async updateThought(req, res) {
        try {
            const updatedThought = await Thought.findByIdAndUpdate(
                req.params.thoughtId,
                req.body,
                { new: true }
            );
            res.json(updatedThought);
        } catch (err) {
            res.status(500).json(err.message);
        }
    },

    // DELETE to remove a thought by its _id
    async deleteThought(req, res) {
        try {
            const thought = await Thought.findByIdAndDelete(
                req.params.thoughtId
            );
            await User.findByIdAndUpdate(thought.userId, {
                $pull: { thoughts: thought._id },
            });
            res.json({ message: 'Thought successfully deleted' });
        } catch (err) {
            res.status(500).json(err.message);
        }
    },

    // POST - create a reaction stored in a single thought's reactions array field
    async addReaction(req, res) {
        try {
            const { thoughtId } = req.params;

            // create the new reaction object
            const newReaction = await Reaction.create({
                reactionBody: req.body.reactionBody,
                username: req.body.username,
            });

            // find the thought with the given ID and push the new reaction into its reactions array
            const updatedThought = await Thought.findByIdAndUpdate(
                thoughtId,
                { $push: { reactions: newReaction } },
                { new: true }
            );

            res.json(newReaction);
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err).message;
        }
    },

    // DELETE - pull and remove a reaction by the reaction's reactionId value
    async removeReaction(req, res) {
        try {
            const { thoughtId, reactionId } = req.params;

            // find the thought with the given ID and remove the reaction with the given ID from its reactions array
            const updatedThought = await Thought.findByIdAndUpdate(
                thoughtId,
                { $pull: { reactions: { reactionId: reactionId } } },
                { new: true }
            );

            res.json({ message: 'Reaction successfully deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json(err.message);
        }
    },
};
