import mongoose from 'mongoose';
var schema = mongoose.Schema;
var pinSchema = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: 'Users',
    },
    topicId: {
      type: schema.Types.ObjectId,
      ref: 'Topics',
    },

  },
  {
    collection: 'pinned',
    timestamps: true,
  },
);
export const PinSchema = mongoose.model('Pinned', pinSchema);
