import Joi from 'joi';
import { validateRequest } from './common.validations';
import { NextFunction, Request, Response } from 'express';

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  console.log('loginValidation', req.body);
  const schema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest({ req, res, next, schema });
};

export const registerValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().optional(),
    password: Joi.string().required(),
    dob: Joi.string().required(),
    phoneNo: Joi.string().optional(),
    confirmPassword: Joi.string().required(),
  });
  validateRequest({ req, res, next, schema });
};
export const checkVerificationCodeValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    code: Joi.string().required(),
  });
  validateRequest({ req, res, next, schema });
};
export const resetPasswordValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    phoneNo: Joi.string().optional(),
    email: Joi.string().optional(),
  });
  validateRequest({ req, res, next, schema });
};
export const resetPasswordVerificationValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    phoneNo: Joi.string().optional(),
    email: Joi.string().optional(),
    code: Joi.string().required(),
    newPassword: Joi.string().required(),
  });
  validateRequest({ req, res, next, schema });
};
