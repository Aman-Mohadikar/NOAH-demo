import { Container } from 'typedi';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import { Password } from '../models';
import MessageService from './messageService';
import {
  TokenValidationResult, Right, Role
} from '../auth';
import {
  HttpException, encrypt, decrypt,
  formatErrorResponse, STATUS, formatSuccessResponse, messageResponse
} from '../utils';
import UserService from './userService';
import { userModel, userLoginDetailsModel, PasswordResetTokenModel } from '../schemas';
dotenv.config();

class SecurityService {
  static TOKEN_EXPIRATION_MINUTES = 1;

  static SAME_IP_TOKEN_EXPIRATION_MINUTES = 60;

  static MAX_LOGIN_ATTEMPTS = 3;

  static ACCOUNT_BLOCK_HOURS = 1;

  static EMAIL_TOKEN_VALIDITY_SECS = 60 * 60 * 1;

  static OTP_TOKEN_VALIDITY_SECS = (0.5 * 60 * 60);

  static INVITATION_VALIDITY_SECS = 60 * 60 * 1;

  constructor() {
    this.txs = Container.get('DbTransactions');
    this.userService = Container.get(UserService);
  }

  // async login(userMetaData, email, password) {
  //   const { ipAddress } = userMetaData;
  //   const messageKey = 'login';
  //   const invalidLoginErr = new HttpException.Forbidden(formatErrorResponse(messageKey, 'invalidCredentials'));

  //   // const user = await userModel.findOne({ email: email }).populate('roleId');
  //   const user = await this.userService.findUserByEmail(email);
  //   console.log("user", user)
  //   let userLoginDetails = await userLoginDetailsModel.findOne({ userId: user?._id });


  //   if (SecurityService.accountBlocked(userLoginDetails)) throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'accountBlocked'));

  //   // const userRoles = user.roles.map(obj => obj.roleName);
  //   // console.log("userRoles", user.roles)
  //   const userRoles = user.roles.map(obj => obj.roleId.roleName);
  //   console.log("userRoles", userRoles);

  //   const isSuperAdmin = userRoles.includes(Role.roleValues.ADMIN_PANEL);
  //   console.log("isSuperAdmin", isSuperAdmin)
  //   if (!isSuperAdmin) {
  //     throw invalidLoginErr;
  //   }

  //   // const roleIds = [];
  //   // user.roles.map(obj => {
  //   //   const roleId = new Role(obj.role).getId();
  //   //   roleIds.push(roleId);
  //   // });

  //   const roleIds = user.roles.map(obj => obj.roleId.role);
  //   // const newRole = parseInt(roleIds)
  //   console.log("roleIds", roleIds);


  //   const largestRole = Math.min(...roleIds);

  //   // console.log("largestRole", largestRole)

  //   if (!user || user.status !== 'ACTIVE' || !bcrypt.compareSync(password, user.password)) {
  //     if (userLoginDetails) {
  //       userLoginDetails.last_wrong_login_attempt = new Date();
  //       userLoginDetails.wrong_login_count += 1;
  //       await userLoginDetails.save();
  //     }
  //     throw invalidLoginErr;
  //   }

  //   if (userLoginDetails) {
  //     userLoginDetails.last_wrong_login_attempt = null;
  //     userLoginDetails.wrong_login_count = 0;
  //     userLoginDetails.last_login = new Date();
  //     userLoginDetails.last_login_ip = ipAddress;
  //     await userLoginDetails.save();
  //   } else {
  //     userLoginDetails = new userLoginDetailsModel({
  //       userId: user._id,
  //       last_login: new Date(),
  //       last_login_ip: ipAddress,
  //       wrong_login_count: 0
  //     });
  //     await userLoginDetails.save();
  //   }

  //   if (await this.canLogin(user)) {
  //     const token = await SecurityService.createToken(ipAddress, user.id, config.authTokens.audience.app, largestRole);
  //     return { token };
  //   }
  //   throw invalidLoginErr;
  // }


  async login(userMetaData, email, password) {
    const { ipAddress } = userMetaData;
    const messageKey = 'login';
    const invalidLoginErr = new HttpException.Forbidden(formatErrorResponse(messageKey, 'invalidCredentials'));

    const user = await userModel.findOne({ email: email });
    let userLoginDetails = await userLoginDetailsModel.findOne({ userId: user?._id });

    if (SecurityService.accountBlocked(userLoginDetails)) throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'accountBlocked'));

    // const roleIds = user.roleId;
    // console.log("roleIds", roleIds);

    if (!user || user.status !== 'ACTIVE' || !bcrypt.compareSync(password, user.password)) {
      if (userLoginDetails) {
        userLoginDetails.last_wrong_login_attempt = new Date();
        userLoginDetails.wrong_login_count += 1;
        await userLoginDetails.save();
      }
      throw invalidLoginErr;
    }

    if (userLoginDetails) {
      userLoginDetails.last_wrong_login_attempt = null;
      userLoginDetails.wrong_login_count = 0;
      userLoginDetails.last_login = new Date();
      userLoginDetails.last_login_ip = ipAddress;
      await userLoginDetails.save();
    } else {
      userLoginDetails = new userLoginDetailsModel({
        userId: user._id,
        last_login: new Date(),
        last_login_ip: ipAddress,
        wrong_login_count: 0
      });
      await userLoginDetails.save();
    }

    if (await this.canLogin(user)) {
      const token = await SecurityService.createToken(ipAddress, user.id, config.authTokens.audience.app, user.roleId);
      return { token };
    }
    throw invalidLoginErr;
  }



  // async login(userMetaData, email, password) {
  //   const { ipAddress } = userMetaData;
  //   const messageKey = 'login';
  //   const invalidLoginErr = new HttpException.Forbidden(formatErrorResponse(messageKey, 'invalidCredentials'));

  //   const user = await userModel.findOne({ email: email });
  //   let userLoginDetails = await userLoginDetailsModel.findOne({ userId: user?._id });

  //   if (SecurityService.accountBlocked(userLoginDetails)) throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'accountBlocked'));

  //   if (!user || user.status !== 'ACTIVE' || !bcrypt.compareSync(password, user.password)) {
  //     if (userLoginDetails) {
  //       userLoginDetails.last_wrong_login_attempt = new Date();
  //       userLoginDetails.wrong_login_count += 1;
  //       await userLoginDetails.save();
  //     }
  //     throw invalidLoginErr;
  //   }

  //   if (userLoginDetails) {
  //     userLoginDetails.last_wrong_login_attempt = null;
  //     userLoginDetails.wrong_login_count = 0;
  //     userLoginDetails.last_login = new Date();
  //     userLoginDetails.last_login_ip = ipAddress;
  //     await userLoginDetails.save();
  //   } else {
  //     userLoginDetails = new userLoginDetailsModel({
  //       userId: user._id,
  //       last_login: new Date(),
  //       last_login_ip: ipAddress,
  //       wrong_login_count: 0
  //     });
  //     await userLoginDetails.save();
  //   }

  //   if (await this.canLogin(user)) {
  //     const token = await SecurityService.createToken(ipAddress, user.id, config.authTokens.audience.app);
  //     return { token };
  //   }
  //   throw invalidLoginErr;
  // }


  async requestResetPasswordLink(dto) {
    const messageKey = 'requestResetPasswordLink';
    const success = formatSuccessResponse(messageKey, 'linkSend');

    try {
      const user = await userModel.findOne({ email: dto.email });

      if (!user) throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidUser'));
      if (!SecurityService.canResetPassword(user)) throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));

      const expiration_time = new Date();
      expiration_time.setHours(expiration_time.getHours() + 1);

      const token = await this.userService.generateRandomToken();
      await this.userService.createResetPasswordTokenForUser({ userId: user.id, token, expiration_time });

      const tokenDto = await this.userService.findResetPasswordTokenForUser({ token });
      if (!tokenDto) throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'tokenNotCreated'));

      await MessageService.sendPasswordReset(user, tokenDto, dto.type);
      return messageResponse(success);

    } catch (error) {
      console.log(error)
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'failed'));
    }
  }



  async resetPassword(dto) {
    const messageKey = 'resetPassword';
    const invalidToken = new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidToken'));

    const tokenDto = await PasswordResetTokenModel.findOne({ token: dto.token });
    if (!tokenDto) {
      throw invalidToken
    }

    const user = await PasswordResetTokenModel.findOne({ user_id: tokenDto.user_id });
    if (!user) {
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidUser'));
    }

    if (tokenDto.is_used) {
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));
    }

    const currentTime = new Date();
    if (currentTime > tokenDto.expiration_time) {
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'tokenExpired'));
    }

    const hash = await new Password(dto.newPassword).hashPassword();

    const idOfUser = parseInt(tokenDto.user_id);

    await this.userService.changeUserPassword({
      user_id: tokenDto.user_id,
      password: hash,
      updatedBy: idOfUser,
    });

    tokenDto.is_used = true;
    await tokenDto.save();

    return messageResponse(formatSuccessResponse(messageKey, 'resetSucccessfully'));
  }



  static async createToken(ipAddress, identifier, aud, roleIds) {
    const payload = {
      exp: SecurityService.anyIpAddressExpiryTimestamp(),
      iat: SecurityService.currentTimestamp(),
      nbf: SecurityService.currentTimestamp(),
      iss: config.authTokens.issuer,
      sub: identifier ? encrypt(identifier.toString()) : null,
      aud: config.authTokens.audience.web,
      version: config.authTokens.version,
      exp2: {
        ip: ipAddress,
        time: SecurityService.sameIpAddressExpiryTimestamp(),
      },
    };
    if (aud && aud === config.authTokens.audience.app) {
      payload.aud = config.authTokens.audience.app;
      delete payload.exp;
      delete payload.exp2;
    }
    if (roleIds) {
      payload.type = roleIds
    }


    return jwt.sign(payload, config.authTokens.privateKey,
      { algorithm: config.authTokens.algorithm }
    );
  }


  async canLogin(user) {
    const messageKey = 'user';
    if (user.status !== STATUS.ACTIVE) {
      throw new HttpException.Unauthorized(formatErrorResponse(messageKey, 'inactiveUser'));
    }
    return true;
  }

  static canResetPassword(user) {
    return (user.status === STATUS.ACTIVE);
  }

  static isExpired(ip, payload, currentTime) {
    return (!SecurityService.isValidForGeneralExpiration(currentTime, payload)
      && !SecurityService.isValidForSameIpExpiration(currentTime, ip, payload));
  }


  async validateToken(ip, payload) {
    if ((payload.aud !== config.authTokens.audience.app)
      && SecurityService.isExpired(ip, payload, moment())) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.EXPIRED);
    } if (SecurityService.isOldVersion(payload)) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.OLD_VERSION);
    }

    try {
      const userId = decrypt(payload.sub);
      const user = await userModel.findOne({ _id: userId })
      if (!user || (user.status !== STATUS.ACTIVE)) {
        return new TokenValidationResult(
          TokenValidationResult.tokenValidationStatus.INACTIVE_USER,
        );
      }
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.VALID, user);
    } catch (e) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.INVALID_USER);
    }
  }


  static accountBlocked(userLoginDetails) {
    let blocked = false;

    if (
      userLoginDetails &&
      userLoginDetails.wrong_login_count >= SecurityService.MAX_LOGIN_ATTEMPTS &&
      userLoginDetails.last_wrong_login_attempt
    ) {
      const blockedTill = moment(userLoginDetails.last_wrong_login_attempt)
        .add(SecurityService.ACCOUNT_BLOCK_HOURS, 'hour');

      const currentTime = moment();

      blocked = currentTime.isBefore(blockedTill) || currentTime.isSame(blockedTill);
    }

    return blocked;
  }

  static currentTimestamp() {
    return moment.utc().unix();
  }

  static anyIpAddressExpiryTimestamp() {
    return moment()
      .add(SecurityService.TOKEN_EXPIRATION_MINUTES, 'minute')
      .unix();
  }

  static sameIpAddressExpiryTimestamp() {
    return moment()
      .add(SecurityService.SAME_IP_TOKEN_EXPIRATION_MINUTES, 'minute')
      .unix();
  }

  static updateToken(ipAddress, identifier, aud, hasTemporaryPassowrd) {
    return SecurityService.createToken(ipAddress, identifier, aud, hasTemporaryPassowrd);
  }

  static isOldVersion(payload) {
    return config.authTokens.version !== payload.version;
  }
}


export default SecurityService;
