const { Schema, model, Types } = require('mongoose');
// const { ObjectId } = Schema.Types;

const reactionSchema = new Schema({
    reactionId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
    },
    reactionBody: {
        type: String,
        required: true,
        maxlength: 280,
    },
    username: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // create index for sorting reactions in descending order
        index: { createdAt: -1 },
    },
},
{
    toJSON: {
        getters: true,
    },
    id: false,
});

const Reaction = model('Reaction', reactionSchema);

module.exports = { Reaction, reactionSchema };