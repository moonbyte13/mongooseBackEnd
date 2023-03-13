const router = require('express').Router();
const {
  getAllThoughts,
  getThoughtById,
  createThought,
  updateThought,
  deleteThought,
  addReaction,
  removeReaction
} = require('../../controllers/thoughtController.js');


// /api/thoughts
router.route('/')
  // GET all thoughts
  .get(getAllThoughts)
  // POST to create a new thought
  .post(createThought);


// /api/thoughts/:thoughtId
router.route('/:thoughtId')
  // GET to get a single thought by its _id
  .get(getThoughtById)
  // PUT to update a thought by its _id
  .put(updateThought)
  // DELETE to remove a thought by its _id
  .delete(deleteThought);



// /api/thoughts/<thoughtId>/reactions
router.route('/:thoughtId/reactions')
  // POST - create a reaction stored in a single thought's reactions array field
  .post(addReaction);


// /api/thoughts/<thoughtId>/reactions/<reactionId>
router.route('/:thoughtId/reactions/:reactionId')
  // DELETE - pull and remove a reaction by the reaction's reactionId value
  .delete(removeReaction)

  
module.exports = router;
