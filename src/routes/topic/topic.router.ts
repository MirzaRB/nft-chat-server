import { Router } from 'express';
import TopicController from '../../controllers/topic/topic.controller';
import { createTopicValidation } from '../../validations/topic.validations';
import { verifyToken, verifyTokenOptional } from '../../validations/common.validations';

class TopicRouter {
  public path = '/topic';
  public router = Router();
  public topicController = new TopicController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/getTrendingTopic`).get(this.topicController.getTrendingTopics);
    this.router.route(`${this.path}/getGlobalTopic`).get(this.topicController.getGlobalTopic);
    this.router
      .route(`${this.path}/getAllTopics`)
      .get(verifyTokenOptional as any, this.topicController.getAllTopics as any);
    this.router
      .route(`${this.path}/getMyOwnedContent`)
      .get(verifyToken as any, this.topicController.getMyOwnedContent as any);
    this.router
      .route(`${this.path}/createTopic`)
      .post(verifyToken as any, createTopicValidation, this.topicController.createTopic as any);
    this.router.route(`${this.path}/update`).patch(verifyToken as any, this.topicController.updateTopic);
    this.router.route(`${this.path}/:id`).get(verifyTokenOptional as any, this.topicController.getTopicById as any);
    this.router.route(`${this.path}/joinMember`).post(verifyToken as any, this.topicController.joinMember);
    this.router.route(`${this.path}/removeMember`).delete(verifyToken as any, this.topicController.removeMember);
    this.router.route(`${this.path}/getMembers/:topicId`).get(this.topicController.getTopicMembersAndCount);
  }
}

export default TopicRouter;
