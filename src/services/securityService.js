import { Container } from 'typedi';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import MessageService from './messageService';
import crypto from 'crypto';
import {
  HttpException, encrypt,
  formatErrorResponse, STATUS, formatSuccessResponse, messageResponse
} from '../utils';
import UserService from './userService';
import { userModel, userLoginDetailsModel, userDetailModel } from '../schemas';
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



  async login(userMetaData, email, password) {
    const { ipAddress } = userMetaData;
    const messageKey = 'login';
    const invalidLoginErr = new HttpException.Forbidden(formatErrorResponse(messageKey, 'invalidCredentials'));

    const user = await userModel.findOne({ email: email });
    let userLoginDetails = await userLoginDetailsModel.findOne({ userId: user?._id });

    if (SecurityService.accountBlocked(userLoginDetails)) throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'accountBlocked'));

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
      const token = await SecurityService.createToken(ipAddress, user.id, config.authTokens.audience.app);
      return { token };
    }
    throw invalidLoginErr;
  }


  async requestResetPasswordLink(dto) {
    const messageKey = 'requestResetPasswordLink';
    const success = formatSuccessResponse(messageKey, 'linkSend');
  
    try {
      // const user = await userModel.findOne({ email: dto.email });
      const userEmail = 'aman@memorres.com';

const user = [
  {
    $match: { email: userEmail } // Match the user by email
  },
  {
    $lookup: {
      from: 'userDetail', // Name of the userDetails collection
      localField: '_id', // Field from users collection
      foreignField: 'userId', // Field from userDetails collection
      as: 'userDetail' // Alias for the joined data
    }
  },
  {
    $project: {
      _id: 1,
      email: 1,
      userDetails: {
        $cond: {
          if: { $eq: [{ $size: '$userDetail' }, 0] }, // If userDetails array is empty
          then: null,
          else: {
            firstName: { $arrayElemAt: ['$userDetail.firstName', 0] },
            lastName: { $arrayElemAt: ['$userDetail.lastName', 0] },
            phone: { $arrayElemAt: ['$userDetail.phone', 0] }
            // Add more fields from userDetails if needed
          }
        }
      }
    }
  }
];
console.log(user)

      if (!user) throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidUser'));
      if (!SecurityService.canResetPassword(user)) {
        throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));
      }
  
      const expiration_time = new Date();
      expiration_time.setHours(expiration_time.getHours() + 1); 
  
      const token = await this.userService.generateRandomToken();
      await this.userService.createResetPasswordTokenForUser({ userId: user.id, token, expiration_time });
  
      const tokenDto = await this.userService.findResetPasswordTokenForUser({ token });
      if (!tokenDto) {
        throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'tokenNotCreated'));
      }
  
      await MessageService.sendPasswordReset(user, tokenDto, dto.type);
      console.log("user", user)
      return messageResponse(success);
  
    } catch (error) {
      console.log(error.message);
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'failed'));
    }
  }
  

  // async requestResetPasswordLink(dto) {
  //   const messageKey = 'requestResetPasswordLink';
  //   const success = formatSuccessResponse(messageKey, 'linkSend');
  //   try {
  //     return await this.txs.withTransaction(async (client) => {
  //       const user = await this.userService.findUserByEmail(client, dto.email);
  //       if (!user) {
  //         throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidUser'));
  //       }
  //       if (!SecurityService.canResetPassword(user)) {
  //         throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));
  //       }
  //       const userRoles = user.roles.map(obj => obj.role);
  //       const isSuperAdmin = userRoles.includes(Role.roleValues.SUPER_ADMIN);
  //       let token = null;
  //       let validitySecs = null;
  //       if (dto.type === RESET_PASSWORD_TYPES.OTP) {
  //         token = `${randomNumber(6)}`;
  //         validitySecs = SecurityService.OTP_TOKEN_VALIDITY_SECS;
  //       } else if (isSuperAdmin && !(dto.type === RESET_PASSWORD_TYPES.OTP)) {
  //         token = uuidv4();
  //         validitySecs = SecurityService.EMAIL_TOKEN_VALIDITY_SECS
  //       }
  //       await this.userService.createResetPasswordTokenForUser(client,
  //         { userId: user.id, token, validitySecs });
  //       /** @todo Send password reset email to users email address */
  //       const tokenDto = await this.userService.findResetPasswordTokenForUser(client,
  //         { token });
  //       if (!tokenDto) {
  //         throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'tokenNotCreated'));
  //       }
  //       await MessageService.sendPasswordReset(user, tokenDto, dto.type);
  //       return messageResponse(success);
  //     });
  //   } catch (error) {
  //     console.log(error.message); // eslint-disable-line no-console
  //     throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'failed'));
  //   }
  // }


  static async createToken(ipAddress, identifier, aud) {
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


  static isOldVersion(payload) {
    return config.authTokens.version !== payload.version;
  }
}


export default SecurityService;
