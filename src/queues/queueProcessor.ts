console.log('queueProcessor');
import mongoose from 'mongoose';
import { MessageSchema } from '../schema/message/message.schema';

export const queueProcessor = async (job: any, done: (error?: Error | null, result?: any) => void) => {
  try {
    const message: any = new MessageSchema();
    console.log('messageData ====>', job.data);
    const { newMessage } = job.data;
    Object.keys(newMessage).map((key) => (message[key] = newMessage[key]));
    await message.save();
    console.log('newMessage1 ====>', newMessage);
    console.log('newMessage2 =======>', message);

    done();
  } catch (error) {
    console.log(error);
  }
};
