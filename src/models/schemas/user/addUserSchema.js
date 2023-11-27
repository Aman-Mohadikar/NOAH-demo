import Joi from 'joi';
import {
  requiredStringValidator, requiredEmailValidator,
  nullableEnumValidator, getEnumArrayFromObj, STATUS, INVITATION_STATUS, phoneNumberValidator, passwordValidator
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  firstName: requiredStringValidator(messageKey, 'firstName'),
  lastName: requiredStringValidator(messageKey, 'lastName'),
  phone: phoneNumberValidator(messageKey, 'phone'),
  email: requiredEmailValidator(messageKey, 'email'),
  password: passwordValidator(messageKey, 'password'),
  roleId: requiredStringValidator(messageKey, 'roleId'),
  invite_status: nullableEnumValidator(getEnumArrayFromObj(INVITATION_STATUS), messageKey, 'invite_status'),
  status: nullableEnumValidator(getEnumArrayFromObj(STATUS), messageKey, 'status')
}))('addUser')).options({ stripUnknown: true });