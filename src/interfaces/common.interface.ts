import { Request } from 'express';
import mongoose from 'mongoose';

export interface CustomRequest extends Request {
  reqUser: {
    id: mongoose.Types.ObjectId;
  };
}
