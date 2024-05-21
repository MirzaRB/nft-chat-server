import { Router } from 'express';
import UserController from '../../controllers/user/user.controller';
import { verifyToken } from '../../validations/common.validations';
import { updateUserInfoValidation } from '../../validations/user.validations';

class UserRoute {
  public path = '/user';
  public router = Router();
  public userController = new UserController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/getUserFromToken`)
      .get(verifyToken as any, this.userController.getUserFromToken as any);
    this.router
      .route(`${this.path}/update`)
      .patch(verifyToken as any, updateUserInfoValidation, this.userController.updateProfile);
    this.router.route(`${this.path}/addFollowers`).post(verifyToken as any, this.userController.addFollowers);
    this.router.route(`${this.path}/getAllFollowers`).get(verifyToken as any, this.userController.getAllFollowers);
    this.router
      .route(`${this.path}/removeFollowers`)
      .delete(verifyToken as any, this.userController.removeMultipleFollowers as any);
    this.router.route(`${this.path}/:id`).get(verifyToken as any, this.userController.getUserById as any);
  }
}

export default UserRoute;
