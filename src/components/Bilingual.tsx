'use client';
import { useLocale } from '@/i18n/LocaleProvider';
export function Bilingual({en,tr}:{en:string;tr:string}){const {locale}=useLocale();return <>{locale==='tr'?tr:en}</>}
