import { SendEmail } from './SendEmail.js';

export const executeFlow = async (campaign, recipients, bodyOverride = null) => {
  for (const recipient of recipients) {
    try {
      await SendEmail(
        recipient,
        campaign.title,
        bodyOverride || campaign.body, 
        campaign._id,
        campaign.plink
      );
      console.log(`✅ Email sent to ${recipient}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${recipient}:`, err.message);
    }
  }
};
