const upload = async (file) => {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Chat-app");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvygt6nwk/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Upload failed");
    }

    return data.secure_url;

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default upload;