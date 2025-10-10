// routes/simulateRoutes.js
import express from 'express';
import { triggerCampaign,delaySend,conditionSend} from '../Controllers/SimulateController.js';
import { protect } from '../Middlewares/AuthMiddleware.js';
const router = express.Router();

router.post('/send', protect, triggerCampaign);
router.post('/delay',protect,delaySend)
router.post('/condition',protect,conditionSend)

export default router;
