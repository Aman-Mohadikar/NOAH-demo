import Joi from 'joi';
import { 
  emailVerificationValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  email_verification_status : emailVerificationValidator(messageKey, 'email_verification_status')
}))('updateUserInvite')).options({ stripUnknown: true });