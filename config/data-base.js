import mongoose from "mongoose";

const connectedDataBase = async () => {
  try {
    const mongoDBURI = process.env.MONGODB_URI;

    if (!mongoDBURI) {
      throw new Error(
        "❌ MONGODB_URI is not defined in environment variables.",
      );
    }

    const cleanURI = mongoDBURI.endsWith("/")
      ? mongoDBURI.slice(0, -1)
      : mongoDBURI;

    await mongoose.connect(cleanURI);

    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

export default connectedDataBase;
