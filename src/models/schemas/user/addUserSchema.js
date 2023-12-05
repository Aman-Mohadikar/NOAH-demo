import Joi from 'joi';
import {
  requiredStringValidator, requiredEmailValidator,
  nullableEnumValidator, getEnumArrayFromObj, STATUS, INVITATION_STATUS, phoneNumberValidator, passwordValidator, requiredNumberValidator, requiredIdValidator
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  firstName: requiredStringValidator(messageKey, 'firstName'),
  lastName: requiredStringValidator(messageKey, 'lastName'),
  phone: phoneNumberValidator(messageKey, 'phone'),
  designationId: requiredStringValidator(messageKey, 'designation'),
  email: requiredEmailValidator(messageKey, 'email'),
  password: passwordValidator(messageKey, 'password'),
  roleId: requiredNumberValidator(messageKey, 'roleId'),
  invite_status: nullableEnumValidator(getEnumArrayFromObj(INVITATION_STATUS), messageKey, 'invite_status'),
  status: nullableEnumValidator(getEnumArrayFromObj(STATUS), messageKey, 'status')
}))('addUser')).options({ stripUnknown: true });