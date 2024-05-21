import { Router } from 'express';
import PinController from '../../controllers/pin/pin.controller';
import { verifyToken } from '../../validations/common.validations';
import { createPinValidation } from '../../validations/pin.validations';

class PinRouter {
  public path = '/pin';
  public router = Router();
  public pinController = new PinController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/pinnedTopic`)
      .post(verifyToken as any, createPinValidation, this.pinController.topicPinned as any);
    this.router
      .route(`${this.path}/getAllPinnedTopics`)
      .get(verifyToken as any, this.pinController.getAllPinnedTopics as any);
    this.router
      .route(`${this.path}/removePinnedTopic/:topicId`)
      .delete(verifyToken as any, this.pinController.removePinnedTopic as any);
  }
}

export default PinRouter;
