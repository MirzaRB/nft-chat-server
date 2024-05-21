import { Router } from 'express';
import MessageController from '../../controllers/message/message.controller';
import { verifyToken } from '../../validations/common.validations';

class MessageRouter {
  public path = '/message';
  public router = Router();
  public messageController = new MessageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/createMessage`).post(this.messageController.createMessage);
    this.router.route(`${this.path}/getMessagesByTopicId/:topicId`).get(this.messageController.getAllMessagesByTopicId);
  }
}

export default MessageRouter;
