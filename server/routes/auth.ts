import { Router } from "express";
const router = Router();

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint placeholder" });
});

router.post("/register", (req, res) => {
  res.json({ message: "Register endpoint placeholder" });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint placeholder" });
});

export { router as authRouter };
