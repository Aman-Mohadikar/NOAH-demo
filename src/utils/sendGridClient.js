import sgMail from '@sendgrid/mail';
import config from '../config';

class SendGridClient {

    async sendEmail(subject, body, to) {
        sgMail.setApiKey(config.sendgrid.apiKey);
        const mailOptions = {
            from: config.sendgrid.from,
            to,
            subject,
            html: body,
        };
        return sgMail
            .send(mailOptions)
            .then(() => {
                /* eslint-disable-next-line  no-console */
                console.log('Success Email sent');
            })
            .catch((error) => {
                /* eslint-disable-next-line  no-console */
                console.error('Error Email sent', error);
            });
    }
}

export default SendGridClient;