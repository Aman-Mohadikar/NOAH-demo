import { Container } from 'typedi';
import {
  routes, featureLevel, publicPost,
} from './utils';
import { AdminService } from '../services';
import { Filter, addUserSchema, sendUserInviteSchema, updateUserInviteSchema } from '../models';

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

  publicPost(featureLevel.production,
    routes.user.VERIFY_EMAIL,
    async (req) => {
      const { token } = req.params;
      const service = Container.get(AdminService);
      const dto = await updateUserInviteSchema.validateAsync(req.body);
      return service.acceptInvitation({ token, ...dto });
    });
};
