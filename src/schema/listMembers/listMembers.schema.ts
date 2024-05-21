import mongoose from 'mongoose';
var schema = mongoose.Schema;
var listMembersSchema = new schema(
  {
    memberId: {
      type: schema.Types.ObjectId,
      ref: 'Users',
    },
    listId: {
      type: schema.Types.ObjectId,
      ref: 'Lists',
    },
    listCreatedBy: {
      type: schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    collection: 'listMembers',
    timestamps: true,
  },
);
export const ListMembersSchema = mongoose.model('ListMembers', listMembersSchema);
