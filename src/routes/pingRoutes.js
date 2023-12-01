import Container from 'typedi';
import { UserService } from '../services';
import {
  routes, featureLevel, get, publicGet,
} from './utils';
import { Right } from '../auth';
import { messageResponse } from '../utils';

/**
   * Token/Health Check endpoints
 * */
export default () => {
  publicGet(featureLevel.production,
    routes.healthCheck,
    async () => messageResponse('ok'));

  publicGet(featureLevel.production,
    // Right.general.PING,
    routes.ping,
    async () => messageResponse('ok'));
  
  publicGet(featureLevel.production,
    // Right.user.ACCOUNT_PING,
    routes.user.ACCOUNT_PING,
    async(req) => {
      const service = Container.get(UserService);
      return service.userAccountActivity({...req.currentUser});
    }
    )
};
