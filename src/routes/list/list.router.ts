import { Router } from 'express';
import ListController from '../../controllers/list/list.controller';
import { verifyToken } from '../../validations/common.validations';

class ListRouter {
  public path = '/list';
  public router = Router();
  public listController = new ListController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/createList`).post(verifyToken as any, this.listController.createList as any);
    this.router.route(`${this.path}/getAllLists`).get(verifyToken as any, this.listController.getAllLists as any);
    this.router
      .route(`${this.path}/deleteList/:listId`)
      .delete(verifyToken as any, this.listController.deleteList as any);
  }
}

export default ListRouter;
