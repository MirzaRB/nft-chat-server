import { NextFunction, Response } from 'express';
import { CustomRequest } from '../interfaces/common.interface';
import { ValidateMiddlewareParamType, verifyJWT } from '../utils/common';

export const validateRequest = ({ req, res, next, schema }: ValidateMiddlewareParamType) => {
  if (Object.keys(req.body).length === 0)
    return res.status(404).json({ success: false, message: 'Request body cannot be empty' });

  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  } else {
    req.body = value;
    next();
  }
};

export const verifyTokenOptional = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const token: any = req.headers.authorization?.split(' ')[1];
  try {
    // if (!token) throw new Error('You are not authorized to perform this action');
    if (token) {
      const userId = await verifyJWT(token);
      if (userId) {
        req.reqUser = { id: userId };
        console.log('req.reqUser.id', req.reqUser.id);
      }
    }
    next();
  } catch (error: any) {
    console.log(error);
    res.status(401).send(error.message);
  }
};

export const verifyToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const token: any = req.headers.authorization?.split(' ')[1];
  try {
    if (!token) throw new Error('You are not authorized to perform this action');

    const userId = await verifyJWT(token);
    req.reqUser = { id: userId };
    console.log('req.reqUser.id', req.reqUser.id);
    next();
  } catch (error: any) {
    console.log(error);
    res.status(401).send(error.message);
  }
};
