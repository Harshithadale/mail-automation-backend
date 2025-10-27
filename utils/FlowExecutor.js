import { SendEmail } from "./SendEmail.js";

export const executeFlow = async (campaign, recipients, customBody = null) => {
  if (!recipients || recipients.length === 0) return;

  const results = [];

  for (const email of recipients) {
    try {
      await SendEmail(
  email,
  campaign.title,
  customBody || campaign.body,
  campaign._id,
  campaign.plink
);

      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
    }

    // Optional delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  return results;
};

