import { Container } from 'typedi';
import {
  routes, featureLevel, get, put, post, patch, deleteMethod, publicPost, publicGet, publicPut, publicDelete,
} from './utils';
import { Right } from '../auth';
import { AdminService } from '../services';
import { Filter, addUserSchema, sendUserInviteSchema, updateAdminSchema } from '../models';

export default () => {


  publicPost(featureLevel.production,
    routes.user.INVITE_USER,
    async (req) => {
      const service = Container.get(AdminService);
      const dto = await sendUserInviteSchema.validateAsync(req.body);
      return service.sendInvitationByEmail(dto, { ...req.currentUser });
    });

  publicPost(featureLevel.production,
    routes.user.ROOT,
    async (req) => {
      const { token } = req.params;
      const service = Container.get(AdminService);
      const dto = await addUserSchema.validateAsync(req.body);
      return service.addAdmin({ token, ...dto }, { ...req.currentUser });
    });

};
