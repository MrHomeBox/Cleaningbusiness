require("dotenv").config();
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendEmail = async (to, subject, html, bcc = []) => {
  const userMsg = {
    to,
    from: "", // Sendgrid Email
    subject,
    html,
    bcc,
  };

  try {
    await sgMail.send(userMsg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: "", //Twilio Phone Number
      to,
    });
    console.log(`SMS sent to ${to}, SID: ${message.sid}`);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

module.exports = { sendEmail, sendSMS };
