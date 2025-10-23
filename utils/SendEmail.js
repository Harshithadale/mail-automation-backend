// utils/SendEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const SendEmail = async (to, subject, html = '', campaignId = null, plink = null) => {
  try {
    let finalHtml = html || '<p>No content provided</p>';

    if (campaignId && plink) {
      const trackingUrl = `https://mail-automation-backend-fxq5.onrender.com/api/track/click?recipient=${encodeURIComponent(to)}&campaignId=${campaignId}&redirect=${encodeURIComponent(plink)}`;

      if (finalHtml.includes(plink)) {
        finalHtml = finalHtml.replace(
          new RegExp(`<a\\s+href=["']${plink}["'].*?>(.*?)<\\/a>`, 'gi'),
          `<a href="${trackingUrl}">${plink}</a>`
        );
      } else {
        finalHtml += `<div style="margin-top:20px;">
          <a href="${trackingUrl}" style="font-size:14px;">${plink}</a>
        </div>`;
      }
    }

    await resend.emails.send({
      from: "daleharshi6045@gmail.com",
      to,
      subject,
      html: finalHtml,
    });

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    throw err;
  }
};
