import UserController from '../../controllers/user/user.controller';
import AuthController from '../../controllers/auth/auth.controller';
import { Router } from 'express';
import {
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  resetPasswordVerificationValidation,
} from '../../validations/auth.validations';

class AuthRoute {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/register`).post(registerValidation, this.authController.register);
    this.router.route(`${this.path}/login`).post(loginValidation, this.authController.login);
    this.router.route(`${this.path}/checkVerification`).post(this.userController.checkVerificationCode);
    this.router.route(`${this.path}/resetPassword`).post(resetPasswordValidation, this.userController.resetPassword);
    this.router
      .route(`${this.path}/resetPasswordVerification`)
      .patch(resetPasswordVerificationValidation, this.userController.resetPasswordVerification);
  }
}

export default AuthRoute;
