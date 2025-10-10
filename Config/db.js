import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect('mongodb+srv://daleharshi6045_db_user:lVDehwl1mtR7mMas@cluster0.mjlibpp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log("DB Connected"))
    .catch((err) => console.error("DB Connection Error:", err));
};
