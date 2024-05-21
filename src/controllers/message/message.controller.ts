import { NextFunction, Request, Response } from 'express';
import { MessageSchema } from '../../schema/message/message.schema';
class MessageController {
  public createMessage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      console.log('createMessage', req.body);
      const { context, topicId, sender } = req.body;
      const messageData = new MessageSchema();
      messageData.context = context;
      messageData.topicId = topicId;
      messageData.sender = sender;
      await messageData.save();
      console.log('Message created successfully', messageData);
      return res.status(200).json({ success: true, data: messageData });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getAllMessagesByTopicId = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;
      const messages = await MessageSchema.find(
        {
          topicId: req.params.topicId,
        },
        {
          context: 1,
          createdAt: 1,
        },
        {
          sort: { createdAt: 1 },
          skip: skip,
          limit: pageSize,
        },
      ).populate({
        path: 'sender',
        select: 'userName email profileImageUrl displayName ', // Specify the fields you want to retrieve
      });
      return res.status(200).json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
export default MessageController;
