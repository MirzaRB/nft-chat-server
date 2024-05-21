import { faker } from '@faker-js/faker';
import { UserSchema } from '../schema/user/user.schema';
import { ListSchema } from '../schema/list/list.schema';

const seed_data: number = (process.env.SEED_DATA as unknown as number) / 2 || 400;

const SeedLists = async () => {
  console.warn('Seeding follower collection');
  const lists = [];
  const users = await UserSchema.find().select('_id');

  for (let i = 0; i < seed_data; i++) {
    const name = faker.lorem.word();
    const createdBy = users[Math.floor(Math.random() * users.length)]._id;
    let list: any = {
      name,
      createdBy,
    };

    lists.push(list);
  }

  await ListSchema.insertMany(lists);

  console.debug(`Total ${lists.length} lists added successfully`);
};
export default SeedLists;
