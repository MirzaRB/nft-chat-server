import Mongo from '../config/db';
import SeedUsers from './user.seeder';
import SeedFollowers from './follower.seeder';
import SeedTopics from './topic.seeder';
import SeedTopicMembers from './topicMembers.seeder';
import SeedLists from './list.seeder';
import SeedListMembers from './listMembers.seeder';
import SeedTopicMembersDaoList from './topicMembersDaoList.seeder';
import SeedMessages from './message.seeder';

const seedDatabase = async () => {
  console.info('SEEDING STARTED');
  await Mongo().connect();

  await SeedUsers();
  await SeedFollowers();
  await SeedLists();
  await SeedListMembers();
  await SeedTopics();
  await SeedTopicMembers();
  await SeedTopicMembersDaoList();
  await SeedMessages();

  console.info('SEEDING ENDED');
};

seedDatabase();
