import { FollowerSchema } from '../schema/follower/follower.schema';
import { TopicSchema } from '../schema/topic/topic.schema';
import { TopicMemberSchema } from '../schema/topicMembers/topicMembers.schema';

const seed_data: number = (process.env.SEED_DATA as unknown as number) || 200;

const SeedTopicMembers = async () => {
  console.warn('Seeding topic collection');

  const topicCreatedBy = await TopicSchema.find({
    audience: 'FOLLOWED',
  }).select('_id createdBy');
  console.log('topicCreatedBy ===>', topicCreatedBy);
  await topicCreatedBy.forEach(async (item) => {
    let topicsMembers = [];
    console.log('item ===>', item);

    const followedDetails = await FollowerSchema.find({
      followedTo: item.createdBy,
    }).select('followedBy followedTo');
    console.log('followedDetails ===>', followedDetails);
    console.log('followedDetails.length ===>', followedDetails.length);
    for (let i = 0; i < followedDetails.length; i++) {
      const topicMember: any = {
        topicId: item._id,
        memberId: followedDetails[i].followedBy,
        topicCreatedBy: item.createdBy,
      };
      topicsMembers.push(topicMember);
    }
    await TopicMemberSchema.insertMany(topicsMembers);
  });

  console.debug(`TopicMembers added successfully`);
};
export default SeedTopicMembers;
