import config from "../config";
import { EmailMessage } from "../models";
import { MESSAGE_TYPES, RESET_PASSWORD_TYPES } from "../utils";
import MessageSendingService from "./messageSendingService";

class MessageService {
  static RESET_PASSWORD_LINK = '/templates/email/reset-password-link.hbs';
  static ADD_ADMIN = '/templates/email/add-admin.hbs';
  static INVITE_USER = '/templates/email/invite-user.hbs';
  static EMAIL_VERIFICATION = '/templates/email/email-verification.hbs';



  static async sendPasswordReset(user, tokenDto) {
    const subject = 'Password Reset Request - Action Required';
        const data = {
          firstName: user.firstName,
          resetPasswordLink: `${config.systemUrls.resetPassword}/${tokenDto.token}`,
        };
        const message = new EmailMessage(subject, MessageService.RESET_PASSWORD_LINK, data);
        await MessageService.safeSendEmailMessage(message, user.email);
  }

  static async sendUserInvitation(user) {
    const subject = 'Welcome to NOAH!';
    let invitationLink = '';
    if (user && user.token) {
      invitationLink = `${config.systemUrls.apiUrl}/invitation/${user.token}`;
    }
    const data = {
      invitationLink: invitationLink,
      logo: "",
    };
    console.log(data);
    const message = new EmailMessage(subject, MessageService.INVITE_USER, data);
    await MessageService.safeSendEmailMessage(message, user.email);
  }


  static async sendInvitationDetail(user, invitationToken) {
    const subject = 'Welcome to NOAH!';
    let invitationLink = '';
    if (invitationToken) {
      invitationLink = `${config.systemUrls.invitationUrl}/${invitationToken}`;
    }
    const data = {
      invitationLink: invitationLink,
    };
    const message = new EmailMessage(subject, MessageService.EMAIL_VERIFICATION, data);
    await MessageService.safeSendEmailMessage(message, user.email);
  }
  

  static async safeSendEmailMessage(message, email) {
    try {
      return await MessageSendingService.sendMessage(message, email, MESSAGE_TYPES.EMAIL);
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.log(`Error sending message for ${email}: ${err.message}`);
    }
    return false;
  }
}

export default MessageService;
