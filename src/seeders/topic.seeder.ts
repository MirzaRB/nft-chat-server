import { faker } from '@faker-js/faker';
import { UserSchema } from '../schema/user/user.schema';
import { TopicSchema } from '../schema/topic/topic.schema';
import { TopicMemberSchema } from '../schema/topicMembers/topicMembers.schema';
import { ListSchema } from '../schema/list/list.schema';
const seed_data: number = (process.env.SEED_DATA as unknown as number) * 10 || 10;
console.log('seed_data', seed_data);
console.log('seed_data for topicMembers', seed_data / 100);

const SeedTopics = async () => {
  console.warn('Seeding topic collection');
  const topics = [];
  const users = await UserSchema.find().select('_id');

  for (let i = 0; i < seed_data; i++) {
    const topicName = faker.lorem.text();
    const topicRules = faker.lorem.sentence();
    const images = faker.image.urlLoremFlickr();
    const mainDescription = `<p><strong>Dear Community,</strong></p>
    <p>${faker.lorem.paragraph()}<br><br></p>
    <div style="text-align:left;"><img src="${images}" alt="undefined" style="height: auto;width: auto"/></div>
    <p><br>💪 How You Can Make a Difference💪<br>${faker.lorem.paragraph()}</p>`;
    const audience = faker.helpers.arrayElement(['FOLLOWED', 'PUBLIC']);
    const status = faker.helpers.arrayElement(['UNPUBLISHED', 'PUBLISHED']);
    const thumbnailUrl = images
    const uploadImagesUrl = [images];
    const createdBy = users[Math.floor(Math.random() * users.length)]._id;
    let topic: any = {
      topicName,
      topicRules,
      mainDescription,
      audience,
      status,
      thumbnailUrl,
      createdBy,
      uploadImagesUrl,
    };

    topics.push(topic);
  }
  const addedTopics = await TopicSchema.insertMany(topics);
  console.log('addedTopics ===>', addedTopics.length);
  await addedTopics.forEach(async (item) => {
    let joinMembers = [];
    if (item.audience === 'PUBLIC') {
      for (let i = 0; i < seed_data / 100; i++) {
        const topicMember: any = {
          topicId: item._id,
          memberId: users[Math.floor(Math.random() * users.length)]._id,
          topicCreatedBy: item.createdBy,
        };
        joinMembers.push(topicMember);
      }
      console.log('joinMembers ===>', joinMembers.length);
      await TopicMemberSchema.insertMany(joinMembers);
    }
  });
  console.debug(`Total ${topics.length} topics added successfully`);
};
export default SeedTopics;
