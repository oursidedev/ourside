import Link from 'next/link';
export function Logo({light=false}:{light?:boolean}){return <Link href="/" aria-label="Ourside home" className={`font-serif text-2xl font-semibold tracking-[-.04em] ${light?'text-white':'text-ink'}`}>Our<span className="italic text-rose">side</span><span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-rose align-top"/></Link>}
