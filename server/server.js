import app from "./app.js";
import { logger } from "./utils/logger.js"; 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`); // Log startup
  console.log(`Server running on http://localhost:${PORT}`);
});
