import mongoose from 'mongoose';
var schema = mongoose.Schema;
var listSchema = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    collection: 'lists',
    timestamps: true,
  },
);
export const ListSchema = mongoose.model('Lists', listSchema);
