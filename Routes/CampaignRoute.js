// routes/campaignRoutes.js
import express from 'express';
import { createCampaign } from '../Controllers/CampaignController.js';
import { protect } from '../Middlewares/AuthMiddleware.js';
const router = express.Router();

router.post('/add',protect, createCampaign);

export default router;
