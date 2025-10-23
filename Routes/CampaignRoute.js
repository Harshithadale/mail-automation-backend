// routes/campaignRoutes.js
import express from 'express';
import { createCampaign, triggerCampaign, delaySend, conditionSend } from '../Controllers/CampaignController.js';
import { protect } from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

// Create a new campaign
router.post('/add', protect, createCampaign);

// Trigger campaign emails to all users
router.post('/trigger', protect, triggerCampaign);

// Delay sending a campaign
router.post('/delay', protect, delaySend);

// Send emails based on conditions (clicked/purchased)
router.post('/condition', protect, conditionSend);

export default router;
