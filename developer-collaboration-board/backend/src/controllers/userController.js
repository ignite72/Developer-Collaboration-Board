import User from "../models/user.js";

function resolveRole(user) {
  const adminEmails = (process.env.ADMIN_EMAILS || "avinash@example.com")
    .split(",")
    .map((email) => email.trim().toLowerCase());

  if (user.role === "admin" || adminEmails.includes(user.email.toLowerCase())) {
    return "admin";
  }

  return "member";
}

export async function getAssignableUsers(_req, res) {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });

    return res.json(
      users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: resolveRole(user)
      }))
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load users",
      error: error.message
    });
  }
}
