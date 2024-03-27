import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = async (file) => {
  const image = await cloudinary.uploader.upload(
    file,
    { folder: "book-recommendation" },
    (res) => res
  );
  return image;
};

const imageUpload = async (req, res) => {
  if (!req.files)
    return res.status(400).json({ message: "Please Upload an image" });
  const fileTypes = ["image/jpeg", "image/png", "image/jpg"];

  const { image } = req.files;

  if (!fileTypes.includes(image.mimetype))
    return res.send("Image formats supported: JPG, PNG, JPEG");

  const imageSize = 1024;
  if (image.size / 1024 > imageSize)
    return res.send(`Image size should be less than ${imageSize}kb`);

  const cloudFile = await upload(image.tempFilePath);
  return cloudFile.secure_url;
};

const getPublicIdFromURL = (url) => {
  const splitUrl = url.split("/"); // split the url into an array
  // get the publicId from the url (banners/344856823748.jpg)
  const imageId = splitUrl[splitUrl.length - 1];
  const imageFolder = splitUrl[splitUrl.length - 2];
  const publicId = `${imageFolder}/${imageId}`;

  return publicId.split(".")[0];
};

const deleteImageFromCloud = async (imageUrl) => {
  const publicId = getPublicIdFromURL(imageUrl);
  await cloudinary.uploader.destroy(publicId);
};

export { deleteImageFromCloud, getPublicIdFromURL, imageUpload };
