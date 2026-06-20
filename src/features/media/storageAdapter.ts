/**
 * Provider-neutral private storage contract.
 * Keep UI code on this boundary so Supabase can later be replaced by R2/S3 without changing screens or mobile business logic.
 */
export interface UploadFileInput { bucket: string; path: string; body: Blob; contentType: string; cacheControl?: string; upsert?: boolean; signal?: AbortSignal; onProgress?: (percent: number) => void; }
export interface UploadedFile { bucket: string; path: string; bytes: number; }
export interface GetSignedUrlInput { bucket: string; path: string; expiresIn: number; }
export interface SignedFileUrl { url: string; expiresAt: string; }
export interface DeleteFileInput { bucket: string; paths: string[]; }
export interface StorageAdapter { uploadFile(input: UploadFileInput): Promise<UploadedFile>; getSignedUrl(input: GetSignedUrlInput): Promise<SignedFileUrl>; deleteFile(input: DeleteFileInput): Promise<void>; }
