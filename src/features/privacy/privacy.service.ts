/** Privacy preferences are advisory; private-row access must always remain protected by RLS. */
import type { UpdatePrivacySettingsInput } from "./privacy.schema"; import type { PrivacySettings } from "./privacy.types";
export interface PrivacyRepository { get(userId: string): Promise<PrivacySettings>; update(userId: string, input: UpdatePrivacySettingsInput): Promise<PrivacySettings>; }
export class PrivacyService { constructor(private readonly repository: PrivacyRepository) {} get(userId: string) { return this.repository.get(userId); } update(userId: string, input: UpdatePrivacySettingsInput) { return this.repository.update(userId, input); } }
