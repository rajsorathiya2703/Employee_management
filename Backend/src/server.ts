import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
