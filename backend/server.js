import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import productsRouter from "./routes/products.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "1fi-emi-backend" });
});

app.use("/api/products", productsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`1Fi EMI backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.error(
      "Make sure MongoDB is running locally, or set MONGODB_URI to a reachable instance (e.g. MongoDB Atlas)."
    );
    process.exit(1);
  }
}

start();
