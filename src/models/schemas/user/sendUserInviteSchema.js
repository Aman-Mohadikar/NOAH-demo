import Joi from 'joi';
import { 
  requiredEmailValidator, requiredNumberValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  email : requiredEmailValidator(messageKey, 'email'),
  roleId: requiredNumberValidator(messageKey, 'role')
}))('sendUserInvite')).options({ stripUnknown: true });