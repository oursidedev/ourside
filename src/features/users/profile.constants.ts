export const PROFILE_CHANGE_COOLDOWNS={avatar_update:10*60*1000,display_name_update:24*60*60*1000,password_change:10*60*1000} as const;
export const AVATAR_MAX_SOURCE_BYTES=5*1024*1024;
export const AVATAR_MIME_TYPES=["image/jpeg","image/png","image/webp","image/avif"] as const;
export const AVATAR_VARIANTS={small:96,medium:256,large:512} as const;
