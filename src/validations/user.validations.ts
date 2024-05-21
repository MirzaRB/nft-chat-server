import Joi from 'joi';
import { validateRequest } from './common.validations';
import { NextFunction, Request, Response } from 'express';

export const updateUserInfoValidation = (req: Request, res: Response, next: NextFunction) => {
  console.log('updateUserInfoValidation', req.body);
  const schema = Joi.object({
    userId: Joi.string().required(),
    userName: Joi.string().optional(),
    displayName: Joi.string().optional(),
    profileImageUrl: Joi.string().optional(),
    dob: Joi.string().optional(),
    phoneNo: Joi.string().optional(),
    isDisabled: Joi.boolean().optional(),
    poddTitle: Joi.string().optional(),
    poddDescription: Joi.string().optional(),
  });
  validateRequest({ req, res, next, schema });
};
