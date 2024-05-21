import path from 'path';
import Queue from 'bull';
import { queueNames, redisOptions } from '../utils/common';
import { queueProcessor } from './queueProcessor';
import { deleteQueueProcessor } from './deleteQueueProcessor';
import { removeFollowersQueueProcessor } from './removeFollowersQueueProcessor';

// Creating queues
const addMessageQueue = new Queue(queueNames.Add_Message_Queue, redisOptions);
const deleteMessageQueue = new Queue(queueNames.Delete_Message_Queue, redisOptions);
const removeFollowerssQueueProcessor = new Queue(queueNames.Remove_Followers_Members_Queue, redisOptions);
// Registering Processors
addMessageQueue.process(queueProcessor);
deleteMessageQueue.process(deleteQueueProcessor);
removeFollowerssQueueProcessor.process(removeFollowersQueueProcessor);
// Defining Actions
addMessageQueue.on('active', (job) => {
  console.log('Started==========>', job.id);
});

addMessageQueue.on('error', (err) => {
  console.log('Add Message QUEUE ERROR============>', JSON.stringify(err));
});

addMessageQueue.on('drained', (job: string) => {
  console.log('Cleaning==========>', job);
});

addMessageQueue.on('completed', (job) => {
  console.log('Completed==========>', job.id);
});

// Defining Actions
deleteMessageQueue.on('active', (job) => {
  console.log('Started==========>', job.id);
});

deleteMessageQueue.on('error', (err) => {
  console.log('Delete Message ERROR============>', JSON.stringify(err));
});

deleteMessageQueue.on('drained', (job: string) => {
  console.log('Cleaning==========>', job);
});

deleteMessageQueue.on('completed', (job) => {
  console.log('Completed==========>', job.id);
});

// Defining Actions
removeFollowerssQueueProcessor.on('active', (job) => {
  console.log('Started==========>', job.id);
});

removeFollowerssQueueProcessor.on('error', (err) => {
  console.log('Remove Followers ERROR============>', JSON.stringify(err));
});

removeFollowerssQueueProcessor.on('drained', (job: string) => {
  console.log('Cleaning==========>', job);
});

removeFollowerssQueueProcessor.on('completed', (job) => {
  console.log('Completed==========>', job.id);
});

export { addMessageQueue, deleteMessageQueue, removeFollowerssQueueProcessor };
