import express from 'express';
import { newEntry, getEntries } from "../controllers/entryControllers.js";

const router = express.Router();

router.post('/entries', newEntry);
router.get('/entries', getEntries);

export default router;