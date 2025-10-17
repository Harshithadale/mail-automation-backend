import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const SendEmail = async (to, subject, html, campaignId = null, plink = null) => {
  try {
    let finalHtml = html;

    if (campaignId && plink) {
      const trackingUrl = `https://mail-automation-backend-fxq5.onrender.com/api/track/click?recipient=${encodeURIComponent(to)}&campaignId=${campaignId}&redirect=${encodeURIComponent(plink)}`;
      const linkRegex = new RegExp(`<a\\s+href=["']${plink}["'].*?>(.*?)<\\/a>`, "gi");
      if (linkRegex.test(finalHtml)) {
        finalHtml = finalHtml.replace(
          linkRegex,
          `<a href="${trackingUrl}">https://tomato-food-del-tau.vercel.app</a>`
        );
      } else {
        finalHtml += `<div style="margin-top:20px;">
          <a href="${trackingUrl}" style="font-size:14px;">${plink}</a>
        </div>`;
      }
    }

    await resend.emails.send({
      from: "DelightLoop <noreply@resend.dev>",
      to,
      subject,
      html: finalHtml,
    });

    console.log("✅ Email sent successfully via Resend");
  } catch (err) {
    console.error("❌ [SendEmail] Resend Error:", err.message);
  }
};
