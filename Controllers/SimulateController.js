import Campaign from '../Models/Campaign.js';
import TrackingModel from '../Models/TrackingModel.js';
import { executeFlow } from '../utils/FlowExecutor.js';
import Myusers from '../Models/Myusers.js';

export const triggerCampaign = async (req, res) => {
  const { campaignId } = req.body;

  if (!campaignId) {
    return res.status(400).json({ error: 'Missing campaignId' });
  }

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const users = await Myusers.find({});
    if (users.length === 0) return res.status(400).json({ error: 'No recipients found in the database' });

    const recipients = users.map(u => u.email);

    try {
      await executeFlow(campaign, recipients);
    } catch (err) {
      console.error('Error executing campaign flow:', err);
      return res.status(500).json({ error: 'Error executing campaign flow' });
    }

    res.status(200).json({ message: `✅ Campaign emails sent successfully to ${recipients.length} users` });
  } catch (err) {
    console.error('TriggerCampaign error:', err);
    res.status(500).json({ error: 'Server error while executing campaign' });
  }
};

export const delaySend = async (req, res) => {
  const { campaignId, delayInMs } = req.body;

  if (!campaignId || !delayInMs) return res.status(400).json({ error: 'Missing campaignId or delayInMs' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const recipients = await Myusers.find({}).distinct('email');
    if (recipients.length === 0) return res.status(400).json({ error: 'No recipients found in the database' });

    setTimeout(async () => {
      try {
        console.log("⏰ Delay completed. Sending follow-up campaign...");
        await executeFlow(campaign, recipients);
      } catch (err) {
        console.error('Error executing delayed campaign:', err);
      }
    }, delayInMs);

    res.json({ message: `Scheduled to send in ${delayInMs / 1000 / 60} minutes` });
  } catch (err) {
    console.error('DelaySend error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const conditionSend = async (req, res) => {
  const { campaignId, condition, emailBody } = req.body;

  if (!campaignId || !condition || !emailBody) return res.status(400).json({ error: 'Missing campaignId, condition, or emailBody' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const filter = { campaignId };
    if (condition.clicked === 'true') filter.clicked = true;
    else if (condition.clicked === 'false') filter.clicked = false;
    if (condition.purchased === 'true') filter.purchased = true;
    else if (condition.purchased === 'false') filter.purchased = false;

    const matchedUsers = await TrackingModel.find(filter).select('recipient');
    const recipients = matchedUsers.map(u => u.recipient);
    if (recipients.length === 0) return res.status(404).json({ error: 'No users matched the selected conditions' });

    try {
      await executeFlow(campaign, recipients, emailBody);
    } catch (err) {
      console.error('Error executing conditional campaign:', err);
      return res.status(500).json({ error: 'Error executing conditional campaign' });
    }

    res.json({ message: `✅ Email sent to ${recipients.length} users matching condition` });
  } catch (err) {
    console.error('ConditionSend error:', err);
    res.status(500).json({ error: 'Server error while processing condition node' });
  }
};
