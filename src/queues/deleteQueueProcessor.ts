import mongoose from 'mongoose';
import { MessageSchema } from '../schema/message/message.schema';
export const deleteQueueProcessor = async (job: any, done: (error?: Error | null, result?: any) => void) => {
  try {
    console.log('deleteQueueProcessor');
    const { messageId } = job.data;
    console.log('deleteQueueProcessor data', job.data);
    const result = await MessageSchema.deleteOne({ _id: messageId });
    console.log('deleteQueueProcessor result', result);
    done();
  } catch (error) {
    console.log(error);
  }
};
