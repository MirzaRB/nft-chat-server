import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var followerSchema = new Schema(
  {
    followedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    followedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    collection: 'followers',
    timestamps: true,
  },
);

// Hashing Password before saving to DB

export const FollowerSchema = mongoose.model('Followers', followerSchema);
