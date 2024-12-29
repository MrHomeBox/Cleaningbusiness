import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY, { debug: true });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PHONE = process.env.ADMIN_PHONE;

const sendEmail = async (to, subject, html, bcc = []) => {

  if (ADMIN_EMAIL) {
    const userMsg = {
      to,
      from: ADMIN_EMAIL, // Sendgrid Email
      subject,
      html,
      bcc,
    };
    
    try {
      await sgMail.send(userMsg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
};

const sendSMS = async (to, body) => {
  if (ADMIN_PHONE) {
    try {
      const message = await client.messages.create({
        body,
        from: ADMIN_PHONE, //Twilio Phone Number
        to,
      });
      console.log(`SMS sent to ${to}, SID: ${message.sid}`);
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  }
};

export { sendEmail, sendSMS };
