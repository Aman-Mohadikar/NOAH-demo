import config from "../config";
import { EmailMessage } from "../models";
import { MESSAGE_TYPES, RESET_PASSWORD_TYPES } from "../utils";
import MessageSendingService from "./messageSendingService";

class MessageService {
  static ADD_ADMIN = '/templates/email/add-admin.hbs';
  static INVITE_USER = '/templates/email/invite-user.hbs';



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


  static async sendNewAdminDetails(user) {
    const subject = 'Welcome to NOAH!';
    const data = {
      firstName: user.firstName,
      email: user.email,
      adminPortalLink: `${config.systemUrls.adminPortal}`,
      logo: "",
    };
    const message = new EmailMessage(subject, MessageService.ADD_ADMIN, data);
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
