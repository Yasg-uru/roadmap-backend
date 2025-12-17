import mongoose from "mongoose";
const ConnectDatabase = async ():Promise<void> => {
  try {
    const response = await mongoose.connect(process.env.MONGO_URI || "", {});
    console.log("Data base is connected :", response.connection.host);
  } catch (error) {
    console.log("Error in database connection", error);
    process.exit(1);
  }
};
export default ConnectDatabase;
