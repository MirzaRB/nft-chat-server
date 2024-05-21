import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.MONGO_DB_URL || '';
const DB_NAME = process.env.MONGO_DB_DATABASE || '';
const DB_USER = process.env.MONGO_DB_USERNAME || '';
const DB_PASSWORD = process.env.MONGO_DB_PASSWORD || '';
const DB_DEBUG = process.env.ENV === 'development' ? true : false;

const Mongo = () => {
  const connect = async () => {
    try {
      mongoose.set('debug', DB_DEBUG);
      mongoose.connection
        .on('error', () => console.log('Database connection error'))
        .on('open', () => {
          console.log('Database connection open');
        })
        .on('connected', () => {
          console.log('Database connected successfully');
        })
        .on('timeout', () => {
          console.log('Database connection timeout');
        })
        .on('close', () => {
          console.log('Database connection closed');
        })
        .on('reconnectFailed', () => {
          console.log('Database reconnection failed');
        })
        .on('disconnected', () => {
          console.log('Database disconnected');
        });
      await mongoose.connect(DB_URL);
    } catch (error) {
      console.log('Database connection error', error);
    }
  };

  const disconnect = async () => {
    await mongoose.connection.close();
  };
  return { connect, disconnect };
};

export default Mongo;
