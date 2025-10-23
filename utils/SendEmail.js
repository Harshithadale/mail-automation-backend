import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const SendEmail = async (to, subject, html, campaignId = null, plink = null) => {
  try {
    let finalHtml = html;

    if (campaignId && plink) {
      const trackingUrl = `https://mail-automation-backend-fxq5.onrender.com/api/track/click?recipient=${encodeURIComponent(to)}&campaignId=${campaignId}&redirect=${encodeURIComponent(plink)}`;
      const linkRegex = new RegExp(`<a\\s+href=["']${plink}["'].*?>(.*?)<\\/a>`, "gi");

      if (linkRegex.test(finalHtml)) {
        finalHtml = finalHtml.replace(linkRegex, `<a href="${trackingUrl}">$1</a>`);
      } else {
        finalHtml += `<div style="margin-top:20px;">
          <a href="${trackingUrl}" style="font-size:14px;">${plink}</a>
        </div>`;
      }
    }

    await resend.emails.send({
      from: process.env.SENDER_EMAIL || "DelightLoop <noreply@resend.dev>",
      to,
      subject,
      html: finalHtml,
      text: finalHtml.replace(/<[^>]+>/g, ""),
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    throw err;
  }
};

