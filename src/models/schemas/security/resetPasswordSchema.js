import Joi from 'joi';
import { requiredStringValidator } from '../../../utils';


export default Joi.object(((messageKey) => ({
  token: requiredStringValidator(messageKey, 'token'),
  newPassword: requiredStringValidator(messageKey, 'newPassword'),
}))('resetPassword')).options({ stripUnknown: true });
