/** Repository-first user service; repository implementations may target Supabase or memory. */
import type { ServiceResult } from "@/types/core";
import type { UpdateProfileInput } from "./user.schema";
import type { UserPrivacySettings, UserProfile, UserSettings } from "./user.types";
export interface UserRepository { getProfile(userId: string): Promise<UserProfile | null>; updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile>; getSettings(userId: string): Promise<UserSettings>; getPrivacy(userId: string): Promise<UserPrivacySettings>; }
export class UserService { constructor(private readonly repository: UserRepository) {} async getProfile(userId: string): Promise<ServiceResult<UserProfile>> { const profile = await this.repository.getProfile(userId); return profile ? { ok: true, data: profile } : { ok: false, code: "NOT_FOUND", message: "Profile not found." }; } updateProfile(userId: string, input: UpdateProfileInput) { return this.repository.updateProfile(userId, input); } }
