import { NextFunction, Request, Response } from 'express';
import { generate } from 'generate-password';
import { Schema } from 'joi';
import { verify } from 'jsonwebtoken';
import { UserSchema } from '../schema/user/user.schema';
import mongoose from 'mongoose';

const secretKey = process.env.JWT_SECRET_KEY || 'SECRETKEY';

export const add = () => 'Test Add';

export const generateVerificationCode = async () => {
  return generate({
    length: 5,
    numbers: true,
    uppercase: false,
    lowercase: false,
  });
};
export enum TopicAudience {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FOLLOWED = 'FOLLOWED',
  DAO_LIST = 'DAO_LIST',
}
export type ValidateMiddlewareParamType = {
  req: Request;
  res: Response;
  next: NextFunction;
  schema: Schema;
};

export enum TopicStatus {
  PUBLISHED = 'PUBLISHED',
  ENDED = 'ENDED',
  UNPUBLISHED = 'UNPUBLISHED',
}
export const SOCKET = {
  CONNECTION: 'connection',
  DISCONNECTING: 'disconnecting',
  DISCONNECTED: 'disconnected',
  MESSAGE: 'message',
  DELETE_MESSAGE: 'deleteMessage',
  NEW_MESSAGE: 'newMessage',
  CONNECTED: 'connected',
};
export type DecodedLoginTokenType = {
  id: string;
  email: string;
  phoneNo: string;
  iat: number;
  exp: number;
};

export const verifyJWT = async (token: string): Promise<any> => {
  const decode: DecodedLoginTokenType = (await verify(token, 'qwe123')) as DecodedLoginTokenType;

  if (!decode) throw new Error('You are not authorized to perform this action');
  const user = await UserSchema.findOne({ _id: decode.id, isDisabled: false });
  if (!user) throw new Error('Account Disabled');

  return new mongoose.Types.ObjectId(user?._id);
};
export const queueNames = {
  Add_Message_Queue: 'Add_Meesage_Queue',
  Delete_Message_Queue: 'Delete_Message_Queue',
  Remove_Followers_Members_Queue: 'Remove_Followers_Members_Queue',
};
export const redisOptions = {
  redis: {
    // password: 'redis-password',
    // user: 'redis-user',
    // port: 6379,
    // host: 'redis-host',
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    // username: process.env.REDIS_USER,
    // password: process.env.REDIS_PASSWORD,
  },
};

export const getEmailPhonePattern = (emailOrPhone: string | null | undefined, isEmail: boolean) => {
  if (isEmail) {
    const splittedEmail: any = emailOrPhone?.split('@');
    const emailDomain = emailOrPhone?.split('@').pop();
    const visiblePart = splittedEmail[0].slice(0, 2);
    const hiddenEmail = `${visiblePart}****@${emailDomain}`;
    return hiddenEmail;
  } else {
    const phoneNo = emailOrPhone?.slice(-3);
    const visiblePart = emailOrPhone?.slice(0, 4);
    const hiddenPhone = `${visiblePart}****${phoneNo}`;
    return hiddenPhone;
  }
};
