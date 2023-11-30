import Joi from 'joi';
import config from '../../../config';
import { requiredStringValidator, nullableEnumValidator, requiredEmailValidator } from '../../../utils';

export default Joi.object(((messageKey) => ({
  email: requiredEmailValidator(messageKey, 'email'),
  password: requiredStringValidator(messageKey, 'password'),
  aud: nullableEnumValidator([
    config.authTokens.audience.web,
    config.authTokens.audience.app],
    messageKey, 'aud'),
}))('login')).options({ stripUnknown: true });
