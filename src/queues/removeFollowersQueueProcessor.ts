import mongoose from 'mongoose';
import { ListMembersSchema } from '../schema/listMembers/listMembers.schema';
import { TopicMemberSchema } from '../schema/topicMembers/topicMembers.schema';
import { FollowerSchema } from '../schema/follower/follower.schema';
export const removeFollowersQueueProcessor = async (job: any, done: (error?: Error | null, result?: any) => void) => {
  try {
    const { followedByArray, userId } = job.data;
    console.log('removeFollowersMembersQueue data', job.data);

    const topicMembers = TopicMemberSchema.deleteMany({
      memberId: { $in: followedByArray },

      topicCreatedBy: new mongoose.Types.ObjectId(userId),
    });

    const listMembers = ListMembersSchema.deleteMany({
      memberId: { $in: followedByArray },

      listCreatedBy: new mongoose.Types.ObjectId(userId),
    });
    const deleteFollowers = FollowerSchema.deleteMany({
      followedBy: { $in: followedByArray },
      followedTo: new mongoose.Types.ObjectId(userId),
    });

    const promises = [topicMembers, listMembers, deleteFollowers];
    await Promise.all(promises);

    done();
  } catch (error) {
    console.log(error);
  }
};
