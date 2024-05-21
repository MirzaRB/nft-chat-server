import Joi from 'joi';
import { validateRequest } from './common.validations';
import { NextFunction, Request, Response } from 'express';

export const createPinValidation = (req: Request, res: Response, next: NextFunction) => {
  console.log('createPinValidation', req.body);
  const schema = Joi.object({
    topicId: Joi.string().required(),
  });

  validateRequest({ req, res, next, schema });
};
