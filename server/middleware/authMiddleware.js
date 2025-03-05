import admin from "../firebaseAdmin.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token); // Verify token

     // Check if the user's email is from searce.com
     if (!decodedToken.email || !decodedToken.email.endsWith("@searce.com")) {
      return res.status(403).json({ error: "Access denied: Only searce.com users are allowed" });
    }

    req.user = decodedToken; // Attach user data to request
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error("Firebase Token Verification Error:", error);
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};
