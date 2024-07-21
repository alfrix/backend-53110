import nodemailer from "nodemailer";

const config = {
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM
}

const transporter = nodemailer.createTransport({
  host: config.MAIL_HOST,
  port: config.MAIL_PORT,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS
  }
});

export const sendEmail = (to, subject, message) => {
  return transporter.sendMail({
    from: config.MAIL_FROM,
    to,
    subject,
    html: message,
  });
};
