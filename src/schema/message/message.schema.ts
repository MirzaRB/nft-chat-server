import mongoose from 'mongoose';
var schema = mongoose.Schema;
var messageSchema = new schema(
  {
    context: {
      type: String,
      required: true,
    },
    sender: {
      type: schema.Types.ObjectId,
      ref: 'Users',
    },
    topicId: {
      type: schema.Types.ObjectId,
      ref: 'Topics',
    },
  },
  {
    collection: 'messages',
    timestamps: true,
  },
);
export const MessageSchema = mongoose.model('Messages', messageSchema);
