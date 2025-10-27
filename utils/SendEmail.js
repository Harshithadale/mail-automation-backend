import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const SendEmail = async (to, subject, html, campaignId, link) => {
  try {
    console.log(`📤 Sending to ${to} with subject "${subject}"`);

    const response = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to,
      subject: subject || "No Subject Provided",
      html: html || "<p>No content</p>",
    });

    console.log(`✅ Email sent successfully to ${to}`, response);
    return response;
  } catch (err) {
    console.error(`❌ Failed to send to ${to}: ${err.message}`);
    throw err;
  }
};

