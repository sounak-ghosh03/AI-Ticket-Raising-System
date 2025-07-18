import express from "express";
import { auth } from "../middleware/auth.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticket.js";

const router = express.Router();

router.get("/", auth, getTickets);
router.get("/:id", auth, getTicket);
router.post("/", auth, createTicket);

export default router;