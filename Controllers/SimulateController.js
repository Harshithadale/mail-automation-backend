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
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const users = await Myusers.find({});
    const recipients = users.map((user) => user.email);

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found in the database' });
    }

    await executeFlow(campaign, recipients);

    res.status(200).json({ message: '✅ Campaign emails sent successfully to all users' });
  } catch (err) {
    // console.error('❌ Error executing campaign:', err.message);
    res.status(500).json({ error: 'Server error while executing campaign' });
  }
};
export const delaySend = async (req, res) => {
  const { campaignId, delayInMs } = req.body;

  if (!campaignId || !delayInMs) {
    return res.status(400).json({ error: 'Missing campaignId or delayInMs' });
  }

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const recipients = await Myusers.find({}).distinct('email'); 

    setTimeout(async () => {
      console.log("⏰ Delay completed. Sending follow-up campaign...");
      await executeFlow(campaign, recipients);
    }, delayInMs);

    res.json({ message: `Scheduled to send in ${delayInMs / 1000 / 60} minutes` });
  } catch (err) {
    // console.error('❌ Delay error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};



export const conditionSend = async (req, res) => {
  const { campaignId, condition, emailBody } = req.body;

  if (!campaignId || !condition || !emailBody) {
    return res.status(400).json({ error: 'Missing campaignId, condition, or emailBody' });
  }

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const filter = { campaignId };
    if (condition.clicked === 'true') filter.clicked = true;
    else if (condition.clicked === 'false') filter.clicked = false;

    if (condition.purchased === 'true') filter.purchased = true;
    else if (condition.purchased === 'false') filter.purchased = false;

    const matchedUsers = await TrackingModel.find(filter).select('recipient');
    const recipients = matchedUsers.map((u) => u.recipient);

    if (recipients.length === 0) {
      return res.status(404).json({ error: 'No users matched the selected conditions' });
    }

    await executeFlow(campaign, recipients, emailBody);

    return res.json({
      message: `✅ Email sent to ${recipients.length} users matching condition`,
    });
  } catch (err) {
    // console.error('❌ conditionSend error:', err.message);
    res.status(500).json({ error: 'Server error while processing condition node' });
  }
};
