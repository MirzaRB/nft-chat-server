import { faker } from '@faker-js/faker';
import { UserSchema } from '../schema/user/user.schema';
import { ListSchema } from '../schema/list/list.schema';
import { TopicSchema } from '../schema/topic/topic.schema';
import { ListMembersSchema } from '../schema/listMembers/listMembers.schema';
import { TopicMemberSchema } from '../schema/topicMembers/topicMembers.schema';

const seed_data: number = (process.env.SEED_DATA as unknown as number)*2 || 200;

const SeedTopicMembersDaoList = async () => {
  console.warn('Seeding topic DaoList collection');
  let topicMembers: any[] = [];
  const topics = [];
  const users = await UserSchema.find().select('_id');

  for (let i = 0; i < seed_data; i++) {
    const topicName = faker.lorem.text();
    const topicRules = faker.lorem.sentence();
    const images = faker.image.urlLoremFlickr();
    const mainDescription = `<p><strong>Dear Community,</strong></p>
    <p>${faker.lorem.paragraph()}<br><br></p>
    <div style="text-align:left;"><img src="${images}"alt="undefined" style="height: auto;width: auto"/></div>
    <p><br>💪 How You Can Make a Difference💪<br>${faker.lorem.paragraph()}</p>`;
    const audience = faker.helpers.arrayElement(['DAO_LIST']);
    const status = faker.helpers.arrayElement(['UNPUBLISHED', 'PUBLISHED']);
    const thumbnailUrl = images
    const createdBy = users[Math.floor(Math.random() * users.length)]._id;
    const daoListIds = await ListSchema.find({ createdBy: createdBy }).select('_id');
    console.log('daoListIds ===>', daoListIds);
    const daoListId = daoListIds[Math.floor(Math.random() * daoListIds.length)]?._id || null;

    let topic: any = {
      topicName,
      topicRules,
      mainDescription,
      audience,
      status,
      thumbnailUrl,
      createdBy,
      daoListId,
    };
    await topics.push(topic);
  }
  const addedTopics = await TopicSchema.insertMany(topics);
  for (const item of addedTopics) {
    const listMembers = await ListMembersSchema.find({
      listId: item.daoListId,
    }).select('memberId');
    console.log('daolist === >, topicId =====>, listMembers ===>', item.daoListId, item._id, listMembers);
    for (let i = 0; i < listMembers.length; i++) {
      const topicMember = {
        memberId: listMembers[i].memberId as any,
        topicId: item._id,
        topicCreatedBy: item.createdBy,
      };
      console.log('topicMember ===>', topicMember);

      topicMembers.push(topicMember);
    }
    console.log('topicMembers ==========>', topicMembers.length, topicMembers);
    await TopicMemberSchema.insertMany(topicMembers);
    topicMembers.length = 0;
    console.log('topicMembers ==========>', topicMembers.length);
  }

  console.debug(`TopicMembers DaoList added successfully`);
};
export default SeedTopicMembersDaoList;
