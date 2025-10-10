import { getUserCampaigns } from "../Controllers/ProfileController.js";
import express from 'express'
import { protect } from "../Middlewares/AuthMiddleware.js";
const router=express.Router()
router.get('/profile',protect,getUserCampaigns)
export default router