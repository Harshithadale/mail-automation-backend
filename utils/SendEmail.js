import nodemailer from 'nodemailer';

export const SendEmail = async (to, subject, html, campaignId = null, plink = null) => {
  try {
    // console.log("📧 [SendEmail] Preparing to send email...");
    // console.log("📥 To:", to);
    // console.log("🔖 Campaign ID:", campaignId);
    // console.log("🔗 Campaign Link (plink):", plink);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    // console.log("✅ [SendEmail] Transporter verified");

    let finalHtml = html;

    if (campaignId && plink) {
      const trackingUrl = `http://localhost:8000/api/track/click?recipient=${encodeURIComponent(to)}&campaignId=${campaignId}&redirect=${encodeURIComponent(plink)}`;

      // Regex to match anchor tags that point directly to the plink
      const linkRegex = new RegExp(`<a\\s+href=["']${plink}["'].*?>(.*?)<\\/a>`, 'gi');

      if (linkRegex.test(finalHtml)) {
finalHtml = finalHtml.replace(
  linkRegex,
  `<a href="${trackingUrl}">https://tomato-food-del-tau.vercel.app</a>`
);
        console.log("🔁 [SendEmail] Replaced existing plink with tracking URL");
      } else {
        // Append the link if it doesn't exist in the email body
        finalHtml += `<div style="margin-top:20px;">
          <a href="${trackingUrl}" style="font-size:14px;">${plink}</a>
        </div>`;
        // console.log("➕ [SendEmail] Appended plink with tracking URL to email body");
      }
    }

    const info = await transporter.sendMail({
      from: `"DelightLoop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: finalHtml,
    });

    // console.log("✅ [SendEmail] Email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ [SendEmail] Error:", err.message);
  }
};
