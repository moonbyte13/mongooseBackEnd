const { Thought, User } = require('../models');

module.exports = {
  // Get all thoughts
  async getAllThoughts(req, res) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Get a single thought by its _id
  async getThoughtById(req, res) {
    try {
      const thought = await Thought.findById(req.params.thoughtId);
      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Create a new thought
  async createThought(req, res) {
    try {
      const thought = await Thought.create(req.body);
      await User.findByIdAndUpdate(thought.userId, { $push: { thoughts: thought._id } });
      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // PUT to update a thought by its _id
  async updateThought(req, res) {
    try {
      const updatedThought = await Thought.findByIdAndUpdate(req.params.thoughtId, req.body, { new: true });
      res.json(updatedThought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // DELETE to remove a thought by its _id
  async deleteThought(req, res) {
    try {
      const thought = await Thought.findByIdAndDelete(req.params.thoughtId);
      await User.findByIdAndUpdate(thought.userId, { $pull: { thoughts: thought._id } });
      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // POST - create a reaction stored in a single thought's reactions array field
  async addReaction(req, res) {
    try {
      const { thoughtId } = req.params;
      const { reactionBody } = req.body;
  
      // create the new reaction object
      const newReaction = await Reaction.create({ reactionBody, username: req.user.username });
  
      // find the thought with the given ID and push the new reaction into its reactions array
      const updatedThought = await Thought.findByIdAndUpdate(
        thoughtId,
        { $push: { reactions: newReaction } },
        { new: true }
      );
  
      res.json(updatedThought);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
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
      console.error(err);
      res.status(500).json(err);
    }
  }
};