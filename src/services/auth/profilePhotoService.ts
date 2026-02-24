const MAX_PROFILE_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PROFILE_PHOTO_STORAGE_PREFIX = "rca.profilePhoto.v1:";
const PROFILE_PHOTO_REMOVED_SENTINEL = "__removed__";

export class ProfilePhotoValidationError extends Error {
  code: "invalid_type" | "file_too_large";

  constructor(message: string, code: "invalid_type" | "file_too_large") {
    super(message);
    this.name = "ProfilePhotoValidationError";
    this.code = code;
  }
}

function getProfilePhotoStorageKey(uid: string): string {
  return `${PROFILE_PHOTO_STORAGE_PREFIX}${uid}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }

      reject(new Error("Unable to read profile photo."));
    };
    reader.onerror = () => reject(new Error("Unable to read profile photo."));
    reader.readAsDataURL(file);
  });
}

export function validateProfilePhotoFile(file: File): void {
  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    throw new ProfilePhotoValidationError("Please upload a JPG, PNG, or WebP image.", "invalid_type");
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    throw new ProfilePhotoValidationError("Profile photo must be 2MB or smaller.", "file_too_large");
  }
}

export function readProfilePhoto(uid: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(getProfilePhotoStorageKey(uid));
  if (!value || value === PROFILE_PHOTO_REMOVED_SENTINEL) {
    return null;
  }

  return value;
}

export function hasStoredProfilePhotoPreference(uid: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(getProfilePhotoStorageKey(uid)) !== null;
}

export async function uploadProfilePhotoFile(params: {
  uid: string;
  file: File;
}): Promise<{ photoURL: string }> {
  validateProfilePhotoFile(params.file);

  if (typeof window === "undefined") {
    throw new Error("Profile photo upload is only available in the browser.");
  }

  const photoURL = await fileToDataUrl(params.file);
  window.localStorage.setItem(getProfilePhotoStorageKey(params.uid), photoURL);
  return { photoURL };
}

export async function deleteProfilePhotoFile(uid: string): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getProfilePhotoStorageKey(uid), PROFILE_PHOTO_REMOVED_SENTINEL);
}
