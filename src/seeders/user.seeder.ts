import { faker } from '@faker-js/faker';
import { UserSchema } from '../schema/user/user.schema';
const seed_data: number = (process.env.SEED_DATA as unknown as number) || 180;

const SeedUsers = async () => {
  console.warn('Seeding user collection');
  const users = [];

  // mapping;
  const emailMap: string[] = [];
  const phoneNoMap: string[] = [];
  const userNameMap: string[] = [];

  for (let i = 0; i < seed_data; i++) {
    const isVerified = true;
    const email = faker.internet.email();
    const phoneNo = faker.phone.number('###-###-###');
    const displayName = faker.person.firstName();
    const userName = faker.internet.userName();
    const profileImageUrl = faker.image.urlLoremFlickr();
    const dob = faker.date.past().toISOString();
    const password = '$2b$10$IPTDvQ1ltZDLKV3J7IkFrOAi2YGpInMYHDlvTN5hOxZo636j.b01m';

    let user = {
      email,
      displayName,
      userName,
      profileImageUrl,
      dob,
      password,
      phoneNo,
      isVerified,
      isDisabled: false,
    };
    if (!emailMap.includes(email) && !phoneNoMap.includes(phoneNo) && !userNameMap.includes(userName)) {
      emailMap.push(email);
      userNameMap.push(userName);
      phoneNoMap.push(phoneNo);
      users.push(user);
    }
  }
  await UserSchema.insertMany(users);
  console.debug(`Total ${emailMap.length} users added successfully`);
};
export default SeedUsers;
