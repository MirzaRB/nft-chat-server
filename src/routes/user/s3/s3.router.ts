import { Router } from 'express';
import S3Controller from '../../../controllers/s3/s3.controller';
import { verifyToken } from '../../../validations/common.validations';

class S3Router {
  public router = Router();
  public path = '/s3';
  private s3Controller = new S3Controller();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.route(`${this.path}/upload-file`).get(verifyToken as any, this.s3Controller.generateSignedUrl as any);
  }
}

export default S3Router;
