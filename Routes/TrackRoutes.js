import express from 'express';
import { trackClick } from '../Controllers/TrackingController.js';
const router = express.Router();

router.get('/click', trackClick);
// router.get('/purchase', trackPurchase);

export default router;
