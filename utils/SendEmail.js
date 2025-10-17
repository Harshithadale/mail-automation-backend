import nodemailer from "nodemailer";

export const SendEmail = async (to, subject, html, campaignId = null, plink = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // App Password (not your real password)
      },
    });

    await transporter.verify();

    let finalHtml = html;

    // ✅ Use deployed backend URL (not localhost)
    if (campaignId && plink) {
      const trackingUrl = `https://your-deployed-backend.com/api/track/click?recipient=${encodeURIComponent(
        to
      )}&campaignId=${campaignId}&redirect=${encodeURIComponent(plink)}`;

      const linkRegex = new RegExp(`<a\\s+href=["']${plink}["'].*?>(.*?)<\\/a>`, "gi");

      if (linkRegex.test(finalHtml)) {
        finalHtml = finalHtml.replace(
          linkRegex,
          `<a href="${trackingUrl}" target="_blank" rel="noopener noreferrer">Visit Our Site</a>`
        );
      } else {
        finalHtml += `<div style="margin-top:20px;">
          <a href="${trackingUrl}" style="font-size:14px;">${plink}</a>
        </div>`;
      }
    }

    const info = await transporter.sendMail({
      from: `"DelightLoop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: finalHtml,
    });

    console.log("✅ Email Sent:", info.messageId, info.accepted, info.rejected);
  } catch (err) {
    console.error("❌ Email Send Error:", err.message);
  }
};

