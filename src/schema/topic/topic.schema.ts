import mongoose from 'mongoose';
import { TopicAudience, TopicStatus } from '../../utils/common';
var schema = mongoose.Schema;
var topicSchema = new schema(
  {
    topicName: {
      type: String,
      required: true,
    },
    type: [
      {
        type: String,
        required: false,
      },
    ],
    topicRules: {
      type: String,
      required: false,
    },
    mainDescription: {
      type: String,
      required: false,
    },
    uploadImagesUrl: [
      {
        type: String,
        required: false,
      },
    ],
    body: {
      type: Object,
      required: false,
    },
    audience: {
      type: String,
      default: TopicAudience.PUBLIC,
    },
    daoListId: {
      type: schema.Types.ObjectId,
      ref: 'Lists',
    },

    createdBy: {
      type: schema.Types.ObjectId,
      ref: 'Users',
    },
    status: {
      type: String,
      default: TopicStatus.UNPUBLISHED,
    },
    thumbnailUrl: {
      type: String,
      required: false,
    },
  },
  {
    collection: 'topics',
    timestamps: true,
  },
);
export const TopicSchema = mongoose.model('Topics', topicSchema);
