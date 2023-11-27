
import { Container } from 'typedi';
import {
  formatErrorResponse, HttpException,
  MESSAGE_TYPES, SendGridClient,
} from '../utils';


class MessageSendingService {
  
  static sendMessageException(error) {
    return new HttpException.ServerError(formatErrorResponse('sendMessage', error));
  }

  static async sendMessage(content, receiver, messageSendType) {
    if (!receiver || receiver.length === 0) {
      throw MessageSendingService.sendMessageException('invalidReceiver');
    }

    let messageResponse;
    switch (messageSendType) {
      case MESSAGE_TYPES.EMAIL:
        messageResponse = await this.sendEmailMessage(content, receiver);
        return messageResponse;
      default:
        throw MessageSendingService.sendMessageException('invalidMessageType');
    }
  }

  static async sendEmailMessage(message, receiver) {
    let formattedMessage;
    try {
      formattedMessage = await message.getFormattedMessage();
    } catch (err) {
      console.log(err);
      throw MessageSendingService.sendMessageException('invalidFormattedMessage');
    }

    const subject = message.getSubject();

    if (!subject || subject.length === 0) {
      throw MessageSendingService.sendMessageException('invalidSubject');
    }

    if (!receiver || receiver.length === 0) {
      throw MessageSendingService.sendMessageException('invalidReceiver');
    }

    const emailClient = Container.get(SendGridClient);
    return emailClient.sendEmail(subject, formattedMessage, receiver);
  }
}

export default MessageSendingService;
