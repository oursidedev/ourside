import { en } from './messages/en'; import { tr } from './messages/tr'; import { de } from './messages/de'; import { es } from './messages/es'; import { fr } from './messages/fr';
export type Locale='en'|'tr'|'de'|'es'|'fr';
export const locales:Locale[]=['en','tr','de','es','fr'];
export const localeMeta={en:{label:'English',short:'EN',flag:'🇺🇸'},tr:{label:'Türkçe',short:'TR',flag:'🇹🇷'},de:{label:'Deutsch',short:'DE',flag:'🇩🇪'},es:{label:'Español',short:'ES',flag:'🇪🇸'},fr:{label:'Français',short:'FR',flag:'🇫🇷'}} as const;
export const dictionaries={en,tr,de,es,fr};
type LeafPaths<T>={ [K in keyof T & string]:T[K] extends string?K:T[K] extends Record<string,unknown>?`${K}.${LeafPaths<T[K]>}`:never }[keyof T & string];
export type TranslationKey=LeafPaths<typeof en>;
export function translate(locale:Locale,path:TranslationKey){const value=path.split('.').reduce<unknown>((obj,key)=>(obj as Record<string,unknown>)?.[key],dictionaries[locale]);return typeof value==='string'?value:path}
export function t(path:TranslationKey){return translate('en',path)}
