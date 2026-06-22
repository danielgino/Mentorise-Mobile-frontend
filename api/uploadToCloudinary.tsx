import axios from "axios";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export async function uploadPdfToCloudinary(fileUri: string) {
    const data = new FormData();

    data.append("file", {
        uri: fileUri,
        type: "application/pdf",
        name: "transcript.pdf",
    } as any);

    data.append("upload_preset", UPLOAD_PRESET);
    data.append("resource_type", "raw");

    const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        data,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );

    return res.data.secure_url;
}

export type CloudinaryImageUploadResult = {
    secureUrl: string;
    publicId: string;
    width?: number;
    height?: number;
};

export async function uploadImageToCloudinary(fileUri: string): Promise<CloudinaryImageUploadResult> {
    const data = new FormData();

    data.append("file", {
        uri: fileUri,
        type: "image/jpeg",
        name: "tutor-profile.jpg",
    } as any);

    data.append("upload_preset", UPLOAD_PRESET);

    const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data
    );

    return {
        secureUrl: res.data.secure_url,
        publicId: res.data.public_id,
        width: res.data.width,
        height: res.data.height,
    };
}
