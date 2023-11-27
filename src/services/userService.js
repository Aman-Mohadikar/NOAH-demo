import { Container } from 'typedi';
import { UserDao } from '../dao';
import { HttpException, formatErrorResponse } from '../utils';
import { Password } from '../models';
import { userModel, roleModel, userInvitationModel } from '../schemas';
import mongoose from 'mongoose';
import crypto from "crypto";

class UserService {
  constructor() {
    this.txs = Container.get('DbTransactions');
    this.dao = Container.get(UserDao);
  }


  async sendInvitation(dto) {
    try {
      console.log("sendInvitation", dto);
      const EXPIRATION_TIME_MINUTES = 60;
      const RESET_TOKEN = await this.generateRandomToken();
      const expirationTime = new Date();
      expirationTime.setTime(expirationTime.getTime() + EXPIRATION_TIME_MINUTES * 60 * 1000);

      const tokenDocument = await userInvitationModel.create({ email: dto.email, token: RESET_TOKEN, expiration_time: expirationTime });

      const user = { email: dto.email, token: tokenDocument.token };
      return user;
    } catch (err) {
      console.log(err);
      throw new HttpException.ServerError(formatErrorResponse(messageKey, 'unableToSend'));
    }
  }


  async createUser(dto, createdBy) {
    console.log("createUser", dto);
    const messageKey = 'createUser';

    if (await this.dao.findDuplicate(dto.email)) throw new HttpException.Conflict(formatErrorResponse(messageKey, 'duplicateUser'));
    if (!mongoose.Types.ObjectId.isValid(dto.roleId)) throw new HttpException.Conflict(formatErrorResponse(messageKey, 'invalidRoleId'));
    if (! await this.dao.findRoleById(dto.roleId)) throw new HttpException.Conflict(formatErrorResponse(messageKey, 'roleNotFound'));

    const tokenData = await this.dao.isTokenExisting(dto.token);
    if (!tokenData) throw new HttpException.NotFound(formatErrorResponse(messageKey, 'tokenNotFound'));
    if (tokenData.is_used !== false) throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidToken'));

    const currentTime = new Date();
    if (tokenData.expiration_time < currentTime) throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'tokenExpired'));

    try {
      const createUserDto = await UserService.createUserDto(dto, createdBy);
      const user = await this.dao.createUser(createUserDto)
      await this.dao.addUserRole(user._id, dto.roleId);
      await userInvitationModel.updateOne({ _id: tokenData._id }, { is_used: true })
      return user;
    } catch (err) {
      console.log(err);
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'unableToCreate'));
    }
  }

  async generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  };

  static generateRandomNumericPassword = (length) => {
    const digits = '0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      password += digits[randomIndex];
    }
    return password;
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
      email: dto.email,
      password: hash,
      roleId: dto.roleId,
      createdBy,
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
