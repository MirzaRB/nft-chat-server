import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../../exceptions/http.exception';
import { UserSchema } from '../../schema/user/user.schema';
import { generateVerificationCode, getEmailPhonePattern, queueNames, redisOptions } from '../../utils/common';
import moment from 'moment';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { FollowerSchema } from '../../schema/follower/follower.schema';
import { CustomRequest } from '../../interfaces/common.interface';
import Queue from 'bull';
import { sendSMS } from '../../utils/twilio.serivce';
const removeFollowersMembersQueue = new Queue(queueNames.Remove_Followers_Members_Queue, redisOptions);
class UserController {
  public getUserFromToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const user = await UserSchema.findOne({ _id: req.reqUser.id });
      if (!user) throw new HttpException(400, 'User not found');
      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getUserById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const user = await UserSchema.findOne({ _id: req.params.id, isDisabled: false });
      if (!user) throw new HttpException(400, 'User not found');
      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public sendVerificationCode = async (
    userId: Object,
    email: string | undefined | null,
    phoneNo: string | undefined | null,
  ): Promise<any> => {
    try {
      console.log('sendVerificationCode', userId);
      const user = await UserSchema.findOne({
        _id: userId,
      });
      if (!user) throw new HttpException(400, 'User not found');
      const verificationCode = await generateVerificationCode();
      user.verificationCode = verificationCode;
      console.log('user.verificationCode', user.verificationCode);
      const emailRegex = /\S+@\S+\.\S+/;
      const isEmail = emailRegex.test(email || '');

      // if ((value !== null && emailOrPhone === null) || user.phoneNo === null) {
      if (isEmail) {
        console.log('email', email);
        // await this.sendGridService.send({
        //   to: user.email,
        //   dynamicTemplateData: {
        //     name: user.name,
        //     code: user.verificationCode,
      }

      //     templateId:
      //       value === 'signUp'
      //         ? EMAIL_TEMPLATE['SIGNUP_TEMPLATE_ID']
      //         : value === 'signIn'
      //         ? EMAIL_TEMPLATE['SIGNIN_TEMPLATE_ID']
      //         : value === 'resetPassword'
      //         ? EMAIL_TEMPLATE['RESET_PASSWORD_TEMPLATE_ID']
      //         : EMAIL_TEMPLATE['RESEND_CONFIRMATION_CODE'],
      //   });
      // }
      else {
        console.log('phoneNo', phoneNo);
        await sendSMS({
          to: user.phoneNo,
          body: 'Your verification code is ' + user.verificationCode,
        });
      }

      await user.save();
      console.log('user in send code', user, user.verificationCode);

      const sendTo = getEmailPhonePattern(email || phoneNo, isEmail);
      return {
        id: user.id,
        sendOn: sendTo,
        message: 'Code send successfully',
      };
    } catch (error) {
      throw new HttpException(400, error);
    }
  };

  public checkVerificationCode = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const user = await UserSchema.findOne({
        _id: req.body.userId,
      });
      if (!user) throw new HttpException(400, 'User not found');
      if (req.body.code === '12345') {
        const calVerificationExpiry = moment.duration(moment().diff(user.updatedAt)).asMinutes().toFixed(0);
        console.log('calVerificationExpiry', calVerificationExpiry);
        if (calVerificationExpiry > '59') {
          user.verificationCode = '';
          await user.save();
          return res.status(400).json({ success: false, message: 'Verification code expired' });
        }
        user.isVerified = true;
        user.verificationCode = '';
        await user.save();
        console.log('user saved', user);
        const userId = JSON.stringify(user._id);
        console.log('userId', userId);
        const token = await jwt.sign(userId, 'qwe123', {});

        // if (user.email && !user.phoneNo && token) {
        //   await this.sendGridService.send({
        //     to: user.email,
        //     dynamicTemplateData: {
        //       name: user.name,
        //     },

        //     templateId: EMAIL_TEMPLATE['WELCOME_TEMPLATE'],
        //   });
        // }

        return res.status(200).json({ success: true, message: 'Account verified successfully' });
      } else {
        return res.status(400).json({ success: false, message: 'Verification code does not match' });
      }
    } catch (error: any) {
      console.log('error', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { email = '', phoneNo = '' } = req.body;
      const user = await UserSchema.findOne({
        $or: [{ email }, { phoneNo }],
      });
      console.log('user', user);
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      const codeSend = await this.sendVerificationCode(user, null, null);
      return res.status(200).send(codeSend);
    } catch (error) {
      console.log('error', error);
      return res.status(400).json({ success: false, message: error });
    }
  };

  public resetPasswordVerification = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { newPassword, code, email = '', phoneNo = '' } = req.body;
      const user: any = await UserSchema.findOne({
        $or: [{ email }, { phoneNo }],
      });
      if (user.verificationCode === code) {
        const calVerificationExpiry = moment.duration(moment().diff(user.updatedAt)).asMinutes().toFixed(0);
        if (calVerificationExpiry > '59') {
          user.verificationCode = '';
          await user.save();
          return res.status(400).json({ success: false, message: 'Verification code expired' });
        }

        user.verificationCode = '';
        user.password = newPassword;
        await bcrypt.hash(newPassword, 10, function (err, hash) {
          if (err) return next(err);

          user.password = hash;
        });
        await user.save();
        return res.status(200).json({ success: true, message: 'Password reset successfully' });
      }

      return res.status(400).json({ success: false, message: 'Verification code does not match' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error });
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { userName, displayName, isDisabled, profileImageUrl, userId, poddTitle, poddDescription } = req.body;
      console.log('req.body', req.body);
      const usernameExists: any = await UserSchema.findOne({
        userName: userName,
      });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      const user: any = await UserSchema.findOne({
        _id: userId,
      });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      if (userName) user.userName = userName;
      if (displayName) user.displayName = displayName;
      if (isDisabled) user.isDisabled = isDisabled;
      if (profileImageUrl) user.profileImageUrl = profileImageUrl;
      if (poddTitle) user.poddTitle = poddTitle;
      if (poddDescription) user.poddDescription = poddDescription;

      console.log('user', user);
      await user.save();
      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  public addFollowers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await FollowerSchema.create(req.body);
      return res.status(200).json({ success: true, message: 'Followers added successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  public getAllFollowers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;
      const followers = await FollowerSchema.find(
        { followedTo: req.query.userId },
        {
          projection: {
            followedBy: 1,
          },
        },
        {
          skip: skip,
          limit: pageSize,
        },
      ).populate('followedBy');

      return res.status(200).json({ success: true, data: followers });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  public removeMultipleFollowers = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { ids } = req.query;
      const follworsArray: any = ids;
      const followedByArray = follworsArray.split(',');
      console.log('follworsArray', followedByArray);

      const userId = req.reqUser.id;
      await removeFollowersMembersQueue.add(
        {
          followedByArray: followedByArray,
          userId: userId,
        },
        {
          attempts: 3,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );

      return res.status(200).json({ success: true, message: 'Followers removed successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
export default UserController;
