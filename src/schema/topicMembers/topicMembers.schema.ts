import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var topicMemberSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topics',
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    topicCreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    collection: 'topicMembers',
    timestamps: true,
  },
);

export const TopicMemberSchema = mongoose.model('TopicMembers', topicMemberSchema);
