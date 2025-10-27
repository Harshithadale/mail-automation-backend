import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const SendEmail = async (to, subject, html, campaignId, link) => {
  try {
    console.log(`📤 Sending to ${to} with subject "${subject}"`);

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS will be upgraded automatically
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // app password
  },
  tls: {
    rejectUnauthorized: false, // allow TLS on some cloud hosts
  },
});

    const formattedHtml = `
      <div style="font-family:Arial, sans-serif; line-height:1.6; color:#333; padding:20px; background-color:#f9f9f9; border-radius:8px;">
        <h2 style="color:#0078D7;">${subject || "No Subject"}</h2>
        <div>${html || "<p>No content provided.</p>"}</div>
        ${
          link
            ? `<p style="margin-top:20px;">
                🔗 <a href="${link}" style="color:#0078D7; text-decoration:none;">
                Click here to open campaign link</a>
              </p>`
            : `<p style="color:#888;">No campaign link provided</p>`
        }
        <p style="font-size:12px; color:#999; margin-top:30px;">Campaign ID: ${campaignId}</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Campaign Bot" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || "No Subject Provided",
      html: formattedHtml,
    });

    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send to ${to}: ${err.message}`);
    throw err;
  }
};
