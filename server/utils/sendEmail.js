import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Event Management & Ticketing" <${process.env.BREVO_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email sending error:", error);
  }
};

export default sendEmail;
