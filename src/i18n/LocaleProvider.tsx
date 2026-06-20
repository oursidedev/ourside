'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translate, type Locale, type TranslationKey } from '.';
type LocaleContextValue={locale:Locale;setLocale:(locale:Locale)=>void;t:(key:TranslationKey)=>string};
const LocaleContext=createContext<LocaleContextValue|null>(null);
export function LocaleProvider({children}:{children:React.ReactNode}){const [locale,setLocaleState]=useState<Locale>('en');useEffect(()=>{const saved=localStorage.getItem('ourside-locale') as Locale|null;if(saved&&['en','tr','de','es','fr'].includes(saved)){setLocaleState(saved);document.documentElement.lang=saved}const theme=localStorage.getItem('ourside-theme');const dark=theme==='dark'||(theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark)},[]);const setLocale=(next:Locale)=>{setLocaleState(next);localStorage.setItem('ourside-locale',next);document.documentElement.lang=next};const value=useMemo(()=>({locale,setLocale,t:(key:TranslationKey)=>translate(locale,key)}),[locale]);return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>}
export function useLocale(){const context=useContext(LocaleContext);if(!context)throw new Error('useLocale must be used inside LocaleProvider');return context}
