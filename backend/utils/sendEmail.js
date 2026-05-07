const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 resolution to prevent ENETUNREACH errors on cloud platforms like Render
dns.setDefaultResultOrder("ipv4first");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `RuralLearn <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);

    return info;
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = sendEmail;