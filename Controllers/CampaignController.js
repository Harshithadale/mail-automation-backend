import Campaign from "../Models/Campaign.js";
import UserModel from "../Models/UserModel.js";
import { SendEmail } from "../utils/SendEmail.js";

export const createCampaign = async (req, res) => {
  try {
    const { title, body, plink, userId } = req.body;

    if (!title || !body || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const campaign = new Campaign({
      title,
      body,
      plink,
      userId,
      delay: 0,
    });
    const saved = await campaign.save();

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email) {
      const subject = '🎯 Campaign Created Successfully';
      const html = `
        <h2>Hi ${user.name || 'there'},</h2>
        <p>Your campaign titled <strong>"${title}"</strong> has been created successfully!</p>
        <p><strong>Campaign ID:</strong> ${saved._id}</p>
        <p>We'll keep you updated on its performance.</p>
        <br />
        <p>Cheers,<br/>DelightLoop Team</p>
      `;

      try {
        await SendEmail(user.email, subject, html);
      } catch (emailErr) {
        // console.error("❌ Email failed to send:", emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: '🎉 Campaign created successfully and email delivery attempted',
      campaign: saved,
    });
  } catch (err) {
    // console.error("❌ Server error:", err.message);
    res.status(500).json({ success: false, message: 'Server error while creating campaign' });
  }
};
