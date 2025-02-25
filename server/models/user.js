import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String }, // Profile Picture
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
