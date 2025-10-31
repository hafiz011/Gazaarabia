import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

(async () => {
  try {
    const info = await transporter.sendMail({
      from: `"Gazaarabia Test" <${process.env.SMTP_USER}>`,
      to: "devsoftware603@gmail.com",
      subject: "SMTP Test",
      text: "Your SMTP setup is working perfectly",
    });
    console.log(" Email sent:", info.response);
  } catch (err) {
    console.error("SMTP failed:", err);
  }
})();
