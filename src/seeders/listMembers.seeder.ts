import { FollowerSchema } from '../schema/follower/follower.schema';
import { ListSchema } from '../schema/list/list.schema';
import { ListMembersSchema } from '../schema/listMembers/listMembers.schema';

const seed_data: number = (process.env.SEED_DATA as unknown as number) * 4 || 200;

const SeedListMembers = async () => {
  console.warn('Seeding list members collection');

  const listCreatedBy = await ListSchema.find().select('_id createdBy');
  console.log('listCreatedBy ===>', listCreatedBy);
  for (const item of listCreatedBy) {
    let listsMembers = [];
    console.log('item ===>', item);

    let listIdMap: string[] = [];
    let memberIdMap: string[] = [];
    const followedDetails = await FollowerSchema.find({
      followedTo: item.createdBy,
    }).select('followedBy followedTo');
    console.log('followedDetails ===>', followedDetails);
    console.log('followedDetails.length ===>', followedDetails.length);
    for (let i = 0; i < followedDetails.length; i++) {
      const listMember: any = {
        listId: item._id,
        memberId: followedDetails[i].followedBy,
        listCreatedBy: item.createdBy,
      };
      listsMembers.push(listMember);
    }
    console.log('listMember ===>', listsMembers.length);
    await ListMembersSchema.insertMany(listsMembers);
    listsMembers.length = 0;
    console.log('listMember ===>', listsMembers.length);
  }

  console.debug(`ListMembers added successfully`);
};
export default SeedListMembers;
