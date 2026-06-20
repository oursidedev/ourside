import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { NavigationFeedback } from '@/components/ui/NavigationFeedback';
import { DialogProvider } from '@/components/shared/dialogs/DialogProvider';
const manrope = Manrope({ subsets:['latin'], variable:'--font-manrope' });
const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-playfair' });
export const metadata: Metadata = { title: { default:'Ourside — Our little world, kept forever', template:'%s · Ourside' }, description:'A private digital memory space for couples.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" suppressHydrationWarning><body className={`${manrope.variable} ${playfair.variable} font-sans antialiased`}><LocaleProvider><ToastProvider><DialogProvider><NavigationFeedback/><div className="fixed inset-0 -z-10 noise pointer-events-none" />{children}</DialogProvider></ToastProvider></LocaleProvider></body></html> }
