import { Container } from 'typedi';
import UserService from './userService';
import { HttpException, INVITATION_STATUS, LOGIN_LOG_TYPE, USER_AUDIT_LOGS_TYPE, convertToIsoDateTime, formatErrorResponse, formatSuccessResponse, messageResponse, randomPasswordGenerator } from '../utils';
import { Role } from '../auth';
import MessageService from './messageService';
import { Password } from '../models';
import { UserDao } from '../dao';
import { userModel } from '../schemas';

class AdminService {
    constructor() {
        this.txs = Container.get('DbTransactions');
        this.userService = Container.get(UserService);
        this.dao = Container.get(UserDao);
    }


    async sendInvitationByEmail(dto) {
        const messageKey = 'sendInvitation';
        try {
            const admin = await this.userService.sendInvitation(dto);

            if (admin && admin.token) {
                await MessageService.sendUserInvitation(admin);
                return messageResponse(formatSuccessResponse(messageKey, 'send'));
            } else {
                throw new HttpException.BadRequest(formatErrorResponse('unableToSend'))
            }
        } catch (err) {
            console.log(err);
            throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToSend'));
        }
    }

    async addAdmin(dto, actionUser) {
        const messageKey = 'createUser';
        const finalDto = {
            ...dto,
        }
        await this.userService.createUser(finalDto, actionUser.id);
        return messageResponse(formatSuccessResponse(messageKey, 'created'));
    }


    static fromAdmin(admin) {
        if (!admin) {
            return null;
        }
        return {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            phone: admin.phone,
            invite_status: admin.invite_status,
            status: admin.status
        };
    }
}

export default AdminService;