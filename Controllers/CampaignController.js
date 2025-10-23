import Campaign from '../Models/Campaign.js';
import TrackingModel from '../Models/TrackingModel.js';
import Myusers from '../Models/Myusers.js';
import { executeFlow } from '../utils/FlowExecutor.js';

// ---------------- Create Campaign ----------------
export const createCampaign = async (req, res) => {
  try {
    const { title, subject, htmlContent, link } = req.body;
    if (!title || !subject || !htmlContent) {
      return res.status(400).json({ error: 'Title, subject, and htmlContent are required' });
    }

    const newCampaign = new Campaign({
      title,
      subject,
      htmlContent,
      link: link || null,
      createdBy: req.user._id, // assuming protect middleware adds req.user
    });

    const savedCampaign = await newCampaign.save();
    res.status(201).json({ message: '✅ Campaign created successfully', campaign: savedCampaign });
  } catch (err) {
    console.error('createCampaign error:', err);
    res.status(500).json({ error: 'Server error while creating campaign' });
  }
};

// ---------------- Trigger Campaign ----------------
export const triggerCampaign = async (req, res) => {
  const { campaignId } = req.body;
  if (!campaignId) return res.status(400).json({ error: 'Missing campaignId' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const users = await Myusers.find({});
    if (!users.length) return res.status(400).json({ error: 'No recipients found' });

    const recipients = users.map(u => u.email);
    const results = await executeFlow(campaign, recipients);

    res.status(200).json({
      message: `✅ Campaign completed. Sent: ${results.filter(r => r.status === 'sent').length}, Failed: ${results.filter(r => r.status === 'failed').length}`,
      results
    });
  } catch (err) {
    console.error('triggerCampaign error:', err);
    res.status(500).json({ error: 'Server error while executing campaign' });
  }
};

// ---------------- Delay Send ----------------
export const delaySend = async (req, res) => {
  const { campaignId, delayInMs } = req.body;
  if (!campaignId || !delayInMs) return res.status(400).json({ error: 'Missing campaignId or delayInMs' });

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const recipients = await Myusers.find({}).distinct('email');
    if (!recipients.length) return res.status(400).json({ error: 'No recipients found' });

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
    console.error('delaySend error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- Condition Send ----------------
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
    if (!recipients.length) return res.status(404).json({ error: 'No users matched the conditions' });

    const results = await executeFlow(campaign, recipients, emailBody);

    res.json({
      message: `✅ Condition-based emails sent. Sent: ${results.filter(r => r.status === 'sent').length}, Failed: ${results.filter(r => r.status === 'failed').length}`,
      results
    });
  } catch (err) {
    console.error('conditionSend error:', err);
    res.status(500).json({ error: 'Server error while processing condition node' });
  }
};
