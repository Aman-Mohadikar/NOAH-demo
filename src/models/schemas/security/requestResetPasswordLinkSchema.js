import Joi from 'joi';
import { requiredEmailValidator } from '../../../utils';


export default Joi.object(((messageKey) => ({
    email: requiredEmailValidator(messageKey, 'email'),
}))('requestResetPasswordLink')).options({ stripUnknown: true });
