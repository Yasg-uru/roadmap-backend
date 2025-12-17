import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary.config({
  cloud_name: "duzmyzmpa",
  api_key: "667322765163825",
  api_secret: "3vbirFk2VL-InUpDy7BMdpPdRdk",
});
const UploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) {
      fs.unlinkSync(localFilePath);
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
export default UploadOnCloudinary;
