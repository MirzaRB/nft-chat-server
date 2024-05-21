import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;

const client = new Twilio(accountSid, authToken);
export const sendSMS = async (data: any) => {
  try {
    console.log('sendSMS');
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONENO, // From a valid Twilio number
      ...data,
    });
    console.log(
      ` 
sending message to ${JSON.stringify(message)}
`,
    );
    return message;
  } catch (e) {
    console.log('e', e);
  }
};
