import Joi from 'joi';
import { validateRequest } from './common.validations';
import { NextFunction, Request, Response } from 'express';

export const createTopicValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    topicName: Joi.string().required(),
    mainDescription: Joi.string().required(),
    type: Joi.array().items(Joi.string().required()),
    audience: Joi.string().required(),
    daoListId: Joi.string().optional(),
    topicRules: Joi.string().required(),
    uploadImagesUrl: Joi.array().items(Joi.string().optional()),
    status: Joi.string().optional(),
  });

  validateRequest({ req, res, next, schema });
};
