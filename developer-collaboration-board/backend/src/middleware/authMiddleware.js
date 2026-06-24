import jwt from "jsonwebtoken";
import User from "../models/user.js";

function getUserRole(email, savedRole = "member") {
  const adminEmails = (process.env.ADMIN_EMAILS || "avinash@example.com")
    .split(",")
    .map((adminEmail) => adminEmail.trim().toLowerCase());

  if (savedRole === "admin" || adminEmails.includes(email.toLowerCase())) {
    return "admin";
  }

  return "member";
}

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found"
      });
    }

    req.user = user;
    req.userRole = getUserRole(user.email, user.role);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token invalid"
    });
  }
}

export function requireAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      message: "Only admins can create tasks"
    });
  }

  next();
}
