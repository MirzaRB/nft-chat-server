import dotEnv from 'dotenv';

dotEnv.config({
  path: '.env',
});

import App from './app';
import UserRoute from './routes/user/user.router';
import AuthRoute from './routes/auth/auth.router';
import TopicRouter from './routes/topic/topic.router';
import MessageRouter from './routes/message/message.router';
import PinRouter from './routes/pin/pin.router';
import ListRouter from './routes/list/list.router';
import S3Router from './routes/user/s3/s3.router';

const app = new App([
  new AuthRoute(),
  new UserRoute(),
  new TopicRouter(),
  new MessageRouter(),
  new PinRouter(),
  new ListRouter(),
  new S3Router(),
]);

app.listen();
