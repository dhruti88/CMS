import admin from "../firebaseAdmin.js";
import { logger, errorLogger } from "../utils/logger.js"

export const verifyFirebaseToken = async (req, res, next) => {
  
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer
    console.log(req.headers);
    

    if (!token) {
      logger.warn("Unauthorized access attempt: No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
     
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify token
    
     // Check if the user's email is from searce.com
     if (!decodedToken.email || !decodedToken.email.endsWith("@searce.com")) {
      logger.warn(`Access denied for user: ${decodedToken.email}`);
      return res.status(403).json({ error: "Access denied: Only searce.com users are allowed" });
    }
    console.log("decodedToken",decodedToken);

    logger.info(`User authenticated: ${decodedToken.email}`);
    req.user = decodedToken; // Attach user data to request
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    errorLogger.error(`Firebase Token Verification Error: ${error.message}`);
    console.error("Firebase Token Verification Error:", error);
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};
