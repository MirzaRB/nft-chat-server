import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../../exceptions/http.exception';
import { UserSchema } from '../../schema/user/user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserController from '../user/user.controller';

class AuthController {
  userController = new UserController();
  public register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      console.log('register user,req.body', req.body);
      const { userName, email, password, dob, phoneNo, confirmPassword } = req.body;
      const usernameExists: any = await UserSchema.findOne({ userName: userName });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      const user = new UserSchema();
      user.userName = userName;
      user.email = email;
      if (password !== confirmPassword) {
        throw new HttpException(400, 'Password does not match');
      }
      user.password = password;
      user.dob = dob;
      user.phoneNo = phoneNo;

      await user.save();

      const codeSend = await this.userController.sendVerificationCode(user._id, user.email, user.phoneNo);
      return res.status(200).send(codeSend);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  public login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      console.log('login, req.body', req.body);
      const { userName, password } = req.body;
      const user = await UserSchema.findOne({
        userName: userName,
      });
      if (!user) throw new HttpException(400, 'User not found');

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) throw new HttpException(400, 'Incorrect Password');

      if (!user.isVerified) {
        // calling here otp code send api
        console.log('user going for send code', user.email, user.phoneNo);
        const codeSend = await this.userController.sendVerificationCode(user._id, user.email, user.phoneNo);
        return res.status(200).send({ success: false, data: codeSend });
      }
      const token = await jwt.sign({ id: user?._id }, 'qwe123', {});
      return res.status(200).json({ success: true, user: user, token: token });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}

export default AuthController;
