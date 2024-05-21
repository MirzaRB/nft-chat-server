import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Mongo from './config/db';
import { Routes } from './interfaces/router.interface';
import errorMiddleware from './middlewares/error.middleware';
import { Server } from 'socket.io';
import http from 'http';
import { socket } from './utils/socket';
import logger from './logger/logger';
import './queues/index';

class App {
  static app: express.Application;
  static httpServer: http.Server;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    App.app = express();
    App.httpServer = http.createServer(App.app);
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 3000;
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    try {
      const io = new Server(App.httpServer, {
        cors: {
          origin: process.env.NODE_ENV === 'production' ? [`${process.env.APP_BASE_URL}`] : '*',
          methods: ['GET', 'POST'],
        },
      });

      socket(io);

      App.httpServer.listen(this.port, async () => {
        console.log(`Server is running on port ${this.port}`);
        await Mongo().connect();
      });
    } catch (error) {
      console.log(error);
    }
  }

  public getServer() {
    return App.app;
  }

  private initializeMiddlewares() {
    App.app.use(morgan('dev'));
    App.app.use(cors({ origin: '*' }));
    App.app.use(helmet());
    App.app.use(express.json());
    App.app.use(express.urlencoded({ extended: true }));
    App.app.use(logger);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      App.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    App.app.use(errorMiddleware);
  }
}

export default App;
