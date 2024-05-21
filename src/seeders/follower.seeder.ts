import { UserSchema } from '../schema/user/user.schema';
import { FollowerSchema } from '../schema/follower/follower.schema';

const seed_data: number = (process.env.SEED_DATA as unknown as number) * 6 || 180;
console.log('seed_data ===>', seed_data);

const SeedFollowers = async () => {
  console.warn('Seeding followers collection');
  const followers = [];
  const users = await UserSchema.find().select('_id');

  // mapping;
  const followedByMap: string[] = [];
  const followedToMap: string[] = [];

  for (let i = 0; i < seed_data; i++) {
    const followedBy = users[Math.floor(Math.random() * users.length)]._id;
    const followedTo = users[Math.floor(Math.random() * users.length)]._id;
    let follower: any = {
      followedBy,
      followedTo,
    };
    if (!followedByMap.includes(followedBy.toString()) && !followedToMap.includes(followedTo.toString())) {
      followedByMap.push(followedBy.toString());

      followedToMap.push(followedTo.toString());
      followers.push(follower);
    }
  }
  await FollowerSchema.insertMany(followers);
  console.debug(`Total ${followers.length} followers added successfully`);
};
export default SeedFollowers;
