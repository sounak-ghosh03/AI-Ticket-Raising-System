import express from "express";
import {
    getUsers,
    login,
    signup,
    updateUser,
    logout,
} from "../controllers/user.js";

import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post("/update-user", auth, updateUser);
router.get("/users", auth, getUsers);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
