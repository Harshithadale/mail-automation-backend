import { add } from "../Controllers/MyuserController.js";
import express from 'express'
const router=express.Router()
router.post("/add",add)
export default router