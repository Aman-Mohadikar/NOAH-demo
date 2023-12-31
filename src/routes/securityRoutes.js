import { Container } from 'typedi';
import { routes, featureLevel, publicPost, publicGet } from './utils';
import { SecurityService } from '../services';

import {
  loginSchema, requestResetPasswordLinkSchema
} from '../models';

/**
 * Login/Signup endpoint
 */
export default () => {
  publicPost(
    featureLevel.production,
    routes.security.LOGIN,
    async (req) => {
      const service = Container.get(SecurityService);
      const { email, password } = await loginSchema.validateAsync(req.body);
      const userMetaData = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      return await service.login(userMetaData, email, password);
    }
  );

  publicPost(
    featureLevel.production,
    routes.security.REQUEST_RESET_PASSWORD_LINK,
    async (req) => {
      const service = Container.get(SecurityService);
      const dto = await requestResetPasswordLinkSchema.validateAsync(req.body);
      return service.requestResetPasswordLink(dto);
    }
  );

  publicPost(
    featureLevel.production,
    routes.security.REQUEST_RESET_PASSWORD_LINK,
    async (req) => {
      const service = Container.get(SecurityService);
      const dto = await requestResetPasswordLinkSchema.validateAsync(req.body);
      return service.requestResetPasswordLink(dto);
    }
  );
};

