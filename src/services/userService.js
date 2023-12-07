import { Container } from 'typedi';
import { UserDao } from '../dao';
import { HttpException, formatErrorResponse } from '../utils';
import { Password } from '../models';
import { userInvitationModel } from '../schemas';
import crypto from "crypto";

class UserService {
  constructor() {
    this.txs = Container.get('DbTransactions');
    this.dao = Container.get(UserDao);
  }


  async sendInvitation(dto) {
    const messageKey = 'sendInvitation';
    try {
      const EXPIRATION_TIME_MINUTES = 60;
      const RESET_TOKEN = await this.generateRandomToken();
      const expirationTime = new Date();
      expirationTime.setTime(expirationTime.getTime() + EXPIRATION_TIME_MINUTES * 60 * 1000);

      if (! await this.dao.findRoleById(dto.roleId)) {
        throw new HttpException.NotFound(formatErrorResponse(messageKey, 'roleNotFound'));
      }

      await this.dao.tokenDocument(dto, RESET_TOKEN, expirationTime);
      const user = { email: dto.email, token: RESET_TOKEN };
      return user;
    } catch (err) {
      console.log(err)
      throw new HttpException.ServerError(formatErrorResponse(messageKey, 'unableToSend'));
    }
  }


  // async createUser(dto, createdBy) {
  //   const messageKey = 'createUser';

  //   if (await this.dao.findDuplicate(dto.email)) throw new HttpException.Conflict(formatErrorResponse(messageKey, 'duplicateUser'));
  //   if (! await this.dao.findRoleById(dto.roleId)) throw new HttpException.Conflict(formatErrorResponse(messageKey, 'roleNotFound'));
  //   if (! await this.dao.findDesignationById(dto.designationId)) throw new HttpException.Conflict(formatErrorResponse(messageKey, 'designationNotFound'));

  //   const tokenData = await this.dao.isTokenExisting(dto.token);

  //   if (!tokenData) throw new HttpException.NotFound(formatErrorResponse(messageKey, 'tokenNotFound'));
  //   if (tokenData.is_used !== false) throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidToken'));

  //   const currentTime = new Date();
  //   if (tokenData.expiration_time < currentTime) throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'tokenExpired'));

  //   try {
  //     const createUserDto = await UserService.createUserDto(dto, createdBy);
  //     const user = await this.dao.createUser(createUserDto)
  //     await userInvitationModel.updateOne({ _id: tokenData._id }, { is_used: true })

  //     const RESET_TOKEN = await this.generateRandomToken();

  //     await this.dao.sendVerificationEmail(user._id, RESET_TOKEN)

  //     return RESET_TOKEN;
  //   } catch (err) {
  //     console.log(err)
  //     throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'unableToCreate'));
  //   }
  // }


  async createUser(dto, createdBy) {
    const messageKey = 'createUser';

    const invitationData = await this.dao.getInvitationData(dto.token);

    if (!invitationData) {
      throw new HttpException.NotFound(formatErrorResponse(messageKey, 'invitationNotFound'));
    }

    try {
      dto.email = invitationData.email;
      dto.roleId = invitationData.roleId;

      if (!await this.dao.findDesignationById(dto.designationId)) {
        throw new HttpException.Conflict(formatErrorResponse(messageKey, 'designationNotFound'));
      }

      const createUserDto = await UserService.createUserDto(dto, createdBy);
      const user = await this.dao.createUser(createUserDto);
      await userInvitationModel.deleteOne({ _id: invitationData._id });

      const RESET_TOKEN = await this.generateRandomToken();
      await this.dao.sendVerificationEmail(user._id, RESET_TOKEN);

      return RESET_TOKEN;
    } catch (err) {
      console.log(err);
      throw new HttpException.ServerError(formatErrorResponse(messageKey, 'unableToCreate'));
    }
  }



  async acceptEmailInvitation(dto) {
    const messageKey = 'updateUser';
    try {
      const updateUserDto = await this.updateUserDto(dto);
      const success = await this.dao.updateInvite(updateUserDto);
      if (!success) throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    } catch (err) {
      throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    }
  }


  async generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  };


  async removeResetPasswordTokenForUser(client, dto) {
    return this.dao.removeResetPasswordTokenForUser(client, dto);
  }

  static generateRandomNumericPassword = (length) => {
    const digits = '0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      password += digits[randomIndex];
    }
    return password;
  }

  async createResetPasswordTokenForUser(dto) {
    return this.dao.createResetPasswordTokenForUser(dto);
  }

  async findResetPasswordTokenForUser(dto) {
    return this.dao.findResetPasswordTokenForUser(dto);
  }

  async findUserById(dto) {
    return this.dao.findUserById(dto);
  }

  async changeUserPassword(dto) {
    return this.dao.changeUserPassword(dto);
  }

  async findUserByEmail(dto) {
    return this.dao.getUserByEmail(dto);
  }

  static async createUserDto(dto = {}, createdBy) {
    let hash = null;
    if (dto.password) {
      hash = await new Password(dto.password).hashPassword();
    }
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      designationId: dto.designationId,
      email: dto.email,
      password: hash,
      roleId: dto.roleId,
      createdBy: createdBy,
    };
  }


  async updateUserDto(dto = {}) {
    return {
      token: dto.token,
      email_verification_status: dto.email_verification_status,
    };
  }


  static fromUser(user) {
    if (!user) {
      return null;
    }
    return {
      ...user,
    };
  }

  static fromUserProfile(user) {
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dialCode: user.dialCode,
      contactNumber: user.contactNumber,
      status: user.status,
    };
  }
}


export default UserService;
