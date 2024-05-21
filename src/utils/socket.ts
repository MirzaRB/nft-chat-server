import { Server } from 'socket.io';
import { SOCKET, queueNames, redisOptions } from './common';
import Queue from 'bull';
import { MessageSchema } from '../schema/message/message.schema';
const addMessageQueue = new Queue(queueNames.Add_Message_Queue, redisOptions);
const deleteMessageQueue = new Queue(queueNames.Delete_Message_Queue, redisOptions);

export const socket = (io: Server) => {
  io.on(SOCKET.CONNECTION, (socket) => {
    console.log(`We are live and connected with socket id of ${socket.id}`);
    socket.emit(SOCKET.CONNECTED, { message: `${socket?.id} connected successfully!!!` });

    socket.on('join_topic', (data: any) => {
      console.log('join_topic', data.topic);
      socket.join(data.topic);
      socket.emit('joined_topic', { message: `joined_topic ${data.topic} successfully!!!` });
    });

    socket.on(SOCKET.MESSAGE, (data: any, cb: any) => {
      try {
        console.log('SOCKET.MESSAGE', data);
        if (data.context && data.topicId && data.sender._id) {
          const newMessage = new MessageSchema();
          newMessage.context = data.context;
          newMessage.topicId = data.topicId;
          newMessage.sender = data.sender._id;
          console.log('newMessage socket', newMessage);
          const messageData = { data: JSON.stringify(data) };
          io.to(data.topicId).emit(SOCKET.NEW_MESSAGE, messageData);
          addMessageQueue.add(
            {
              newMessage,
            },
            {
              attempts: 3,
              removeOnComplete: true,
              removeOnFail: true,
            },
          );

          // cb(messageData);
        }
      } catch (err) {
        console.log('err', err);
      }
    });

    socket.on(SOCKET.DELETE_MESSAGE, async (data: any) => {
      try {
        console.log('SOCKET.DELETE_MESSAGE', data);
        deleteMessageQueue.add(
          {
            messageId: data.messageId,
          },
          {
            attempts: 3,
            removeOnComplete: true,
            removeOnFail: true,
          },
        );

        io.to(data.topicId).emit(SOCKET.DELETE_MESSAGE, { data: JSON.stringify(data.messageId) });
      } catch (err) {
        console.log('err', err);
      }
    });

    socket.on(SOCKET.DISCONNECTING, () => {
      console.log('DISCONNECTING!!!');
    });
    socket.on(SOCKET.DISCONNECTED, () => {
      console.log('DISCONNECTED!!!');
    });
  });
};
