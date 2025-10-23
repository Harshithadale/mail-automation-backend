import Campaign from '../Models/Campaign.js';
import TrackingModel from '../Models/TrackingModel.js';
import Myusers from '../Models/Myusers.js';
import { SendEmail } from '../utils/SendEmail.js';

// ---------------- Execute flow safely ----------------
export const executeFlow = async (campaign, recipients, customBody = null) => {
  let successCount = 0;
  let failedRecipients = [];

  for (const recipient of recipients) {
    try {
      await SendEmail(recipient, campaign.subject, customBody || campaign.html);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to send email to ${recipient}:`, err.message);
      failedRecipients.push(recipient);
    }
  }

  console.log(`✅ Emails sent: ${successCount}`);
  if (failedRecipients.length > 0) console.log('❌ Failed recipients:', failedRecipients);

  return { successCount, failedRecipients };
};

// ---------------- Trigger Campaign ----------------
export const triggerCampaign = async (req, res) => {
  const { campaignId } = req.body;
  if (!campaignId) return res.status(400).json({ error: 'Missing campaignId' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const users = await Myusers.find({}).select('email');
    if (users.length === 0) return res.status(400).json({ error: 'No recipients found' });

    const recipients = users.map(u => u.email).filter(Boolean); // remove empty emails

    const { successCount, failedRecipients } = await executeFlow(campaign, recipients);

    res.status(200).json({
      message: `Campaign finished: ${successCount} emails sent`,
      failedRecipients
    });

  } catch (err) {
    console.error('TriggerCampaign error:', err);
    res.status(500).json({ error: 'Server error while executing campaign' });
  }
};

// ---------------- Delay Campaign ----------------
export const delaySend = async (req, res) => {
  const { campaignId, delayInMs } = req.body;
  if (!campaignId || !delayInMs) return res.status(400).json({ error: 'Missing campaignId or delayInMs' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const users = await Myusers.find({}).select('email');
    const recipients = users.map(u => u.email).filter(Boolean);
    if (recipients.length === 0) return res.status(400).json({ error: 'No recipients found' });

    setTimeout(async () => {
      console.log(`⏰ Delay completed. Sending campaign "${campaign.subject}"`);
      await executeFlow(campaign, recipients);
    }, delayInMs);

    res.json({ message: `Scheduled to send in ${delayInMs / 1000 / 60} minutes` });
  } catch (err) {
    console.error('DelaySend error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- Condition Campaign ----------------
export const conditionSend = async (req, res) => {
  const { campaignId, condition, emailBody } = req.body;
  if (!campaignId || !condition || !emailBody) return res.status(400).json({ error: 'Missing fields' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const filter = { campaignId };
    if (condition.clicked === 'true') filter.clicked = true;
    else if (condition.clicked === 'false') filter.clicked = false;
    if (condition.purchased === 'true') filter.purchased = true;
    else if (condition.purchased === 'false') filter.purchased = false;

    const matchedUsers = await TrackingModel.find(filter).select('recipient');
    const recipients = matchedUsers.map(u => u.recipient).filter(Boolean);
    if (recipients.length === 0) return res.status(404).json({ error: 'No users matched the condition' });

    const { successCount, failedRecipients } = await executeFlow(campaign, recipients, emailBody);

    res.json({
      message: `Condition campaign finished: ${successCount} emails sent`,
      failedRecipients
    });
  } catch (err) {
    console.error('ConditionSend error:', err);
    res.status(500).json({ error: 'Server error while processing condition campaign' });
  }
};
