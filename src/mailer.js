import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'asa.koss46@ethereal.email',
      pass: 'yfbjTzwvMjsB5jHRqs'
  }
});

export const sendEmail = (to, subject, message) => {
  return transporter.sendMail({
    from: "Ecommerce 53110",
    to,
    subject,
    html: message,
  });
};
