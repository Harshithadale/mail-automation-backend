import Campaign from '../Models/Campaign.js';
import TrackingModel from '../Models/TrackingModel.js';

export const getUserCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId)
    const campaigns = await Campaign.find({ userId }).lean();
    console.log(campaigns)

    const enrichedCampaigns = await Promise.all(
      campaigns.map(async (camp) => {
        const trackings = await TrackingModel.find({ campaignId: camp._id });
        const clicked = trackings.filter((t) => t.clicked).length;
        const purchased = trackings.filter((t) => t.purchased).length;

        return {
          _id: camp._id,
          title: camp.title,
          createdAt: camp.createdAt,
          sentCount: trackings.length,
          clicked,
          purchased,
        };
      })
    );

    res.json({ campaigns: enrichedCampaigns });
  } catch (err) {
    console.error('❌ Error in getUserCampaigns:', err.message);
    res.status(500).json({ error: 'Failed to load campaign data' });
  }
};
