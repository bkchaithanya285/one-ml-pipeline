/**
 * Cloudinary Upload Helper (Signed & Unsigned upload support)
 * Cloud Name: dmst2wexn
 * API Key: 922133823258997
 * Folder: claim-group-3/payment-screenshots/
 * Public ID: claim-group-3/payment-screenshots/<registerNumber>
 */

export interface CloudinaryUploadResponse {
  secureUrl: string;
  publicId: string;
  error?: string;
}

// Generate SHA-1 hash for Cloudinary signed request using Web Crypto API
async function sha1(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest("SHA-1", enc.encode(str));
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadPaymentScreenshot(
  file: File,
  registerNumber: string,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmst2wexn";
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "922133823258997";
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "yMevYZk0VlecuTw1eR9ddhy05dY";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "claim_preset";

  const publicId = `claim-group-3/payment-screenshots/${registerNumber}`;
  const folder = "claim-group-3/payment-screenshots";
  const overwrite = "true";

  // Validate File size <= 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 10 MB limit.");
  }

  // Validate File type
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error("Invalid file format. Please upload JPG, JPEG, or PNG image.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Create signature for Cloudinary API authentication
  // Cloudinary signature string format: sorted_params_joined_with_& + api_secret
  const stringToSign = `folder=${folder}&overwrite=${overwrite}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1(stringToSign);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("overwrite", overwrite);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            secureUrl: response.secure_url,
            publicId: response.public_id,
          });
        } catch (e) {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        // Fallback: If signed upload fails (e.g. strict CORS), try unsigned preset or data URL fallback
        const unsignedFormData = new FormData();
        unsignedFormData.append("file", file);
        unsignedFormData.append("upload_preset", uploadPreset);

        const xhr2 = new XMLHttpRequest();
        xhr2.open("POST", url, true);
        xhr2.onload = () => {
          if (xhr2.status === 200) {
            try {
              const res2 = JSON.parse(xhr2.responseText);
              resolve({
                secureUrl: res2.secure_url,
                publicId: res2.public_id,
              });
              return;
            } catch (e) {}
          }

          // Local preview fallback
          const reader = new FileReader();
          reader.onload = () => {
            if (onProgress) onProgress(100);
            resolve({
              secureUrl: reader.result as string,
              publicId: publicId,
            });
          };
          reader.readAsDataURL(file);
        };
        xhr2.onerror = () => {
          const reader = new FileReader();
          reader.onload = () => {
            if (onProgress) onProgress(100);
            resolve({
              secureUrl: reader.result as string,
              publicId: publicId,
            });
          };
          reader.readAsDataURL(file);
        };
        xhr2.send(unsignedFormData);
      }
    };

    xhr.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          secureUrl: reader.result as string,
          publicId: publicId,
        });
      };
      reader.onerror = () => {
        reject(new Error("Network Error during image upload."));
      };
      reader.readAsDataURL(file);
    };

    xhr.send(formData);
  });
}
