import { Container } from 'typedi';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import { Password } from '../models';
import MessageService from './messageService';
import {
  TokenValidationResult, Right, Role, Authentication
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

  //   const user = await userModel.findOne({ email: email });
  //   console.log("user", user)
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
  //     // Construct roleMap
  //     const roleMap = {
  //       ADMIN_PANEL: 1,
  //       TECH_MANAGER_PANEL: 2,
  //       HR_PANEL: 3
  //     };

  //     // Use the roleMap to assign roleId in the token
  //     const roleId = roleMap[user.roleId]; // Replace 'user.role' with the actual field from the user object
  //     console.log("roleId", roleId)

  //     // Create a token with roleId
  //     const token = await SecurityService.createToken(ipAddress, user.id, config.authTokens.audience.app, roleId);

  //     // Sending mappedRoles to the Frontend team
  //     const mappedRoles = Object.keys(roleMap);
  //     console.log("mappedRoles", mappedRoles)
  //     // FrontendTeam.send(mappedRoles);

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



  static async createToken(ipAddress, identifier, aud, roleId) {
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
    if (roleId) {
      payload.type = roleId
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
    // console.log("user", user)
    return true;
    // return Authentication.hasRight(user, Right.general.LOGIN);
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
