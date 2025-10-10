import Tracking from '../Models/TrackingModel.js';
import Myusers from '../Models/Myusers.js';

export const trackClick = async (req, res) => {
  const { recipient, campaignId, redirect } = req.query;

//   console.log("📥 [trackClick] Params:", { recipient, campaignId, redirect });

  if (!recipient || !campaignId || !redirect) {
    // console.warn("⚠️ [trackClick] Missing data");
    return res.status(400).send("Missing recipient, campaignId, or redirect");
  }

  try {
    const trackingUpdate = await Tracking.findOneAndUpdate(
      { recipient, campaignId },
      { $set: { clicked: true } },
      { upsert: true, new: true }
    );
    console.log("✅ [trackClick] Tracking updated:", trackingUpdate);

    const userUpdate = await Myusers.findOneAndUpdate(
      { email: recipient },
      { $set: { status: 'opened' } },
      { new: true }
    );
    if (userUpdate) {
      console.log("✅ [trackClick] User status updated:", userUpdate.email);
    }

    res.redirect(redirect);
  } catch (err) {
    // console.error("❌ [trackClick] Error:", err.message);
    res.status(500).send("Server error");
  }
};
