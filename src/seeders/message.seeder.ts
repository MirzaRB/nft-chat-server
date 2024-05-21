import { faker } from '@faker-js/faker';
import { UserSchema } from '../schema/user/user.schema';
import { FollowerSchema } from '../schema/follower/follower.schema';
import { TopicSchema } from '../schema/topic/topic.schema';
import { MessageSchema } from '../schema/message/message.schema';

const seed_data: number = (process.env.SEED_DATA as unknown as number) * 100 || 180;
console.log('seed_data ===>', seed_data);

const SeedMessages = async () => {
  console.warn('Seeding messages collection');
  const messages: any = [];
  const users = await UserSchema.find().select('_id');
  const topics = await TopicSchema.find({ status: 'PUBLISHED' }).select('_id');
  console.log('topics ===>', topics);

  // mapping;

  for (let i = 0; i < seed_data; i++) {
    const sender = users[Math.floor(Math.random() * users.length)]._id;
    const topicId = topics[Math.floor(Math.random() * topics.length)]._id;
    const context = faker.lorem.text();
    let message: any = {
      topicId,
      context,
      sender,
    };

    messages.push(message);
  }

  await MessageSchema.insertMany(messages);
  console.debug(`Total ${messages.length} messages added successfully`);
};
export default SeedMessages;
