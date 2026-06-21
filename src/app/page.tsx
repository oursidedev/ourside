import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  Camera,
  Heart,
  LockKeyhole,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { FloatingHearts } from "@/components/FloatingHearts";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingSection } from "@/components/PricingSection";
import { Bilingual } from "@/components/Bilingual";
import { marketingImages as images } from "@/data/marketing-images";
import { appUrl, marketingUrl } from "@/config/brand";
import { LandingHeader } from "@/components/marketing/LandingHeader";
const features = [
  [
    Camera,
    "Shared Memories",
    "Ortak Anılar",
    "Keep photos and the stories behind them, together.",
    "Fotoğrafları ve ardındaki hikâyeleri birlikte saklayın.",
    "/memories",
  ],
  [
    Heart,
    "Private Gallery",
    "Özel Galeri",
    "A camera roll that belongs only to the two of you.",
    "Yalnızca ikinize ait özel bir fotoğraf arşivi.",
    "/gallery",
  ],
  [
    LockKeyhole,
    "Future Letters",
    "Gelecek Mektupları",
    "Seal words now and choose when they can be opened.",
    "Bugünün sözlerini mühürleyin, ne zaman açılacağını seçin.",
    "/vault",
  ],
  [
    TimerReset,
    "Our Timeline",
    "Zaman Çizelgemiz",
    "See the small days and turning points as one story.",
    "Küçük günleri ve dönüm noktalarını tek bir hikâye olarak görün.",
    "/memories",
  ],
  [
    CalendarHeart,
    "Important Dates",
    "Önemli Tarihler",
    "Remember what matters without making it feel like a calendar.",
    "Değerli tarihleri sıradan bir takvim hissi olmadan hatırlayın.",
    "/milestones",
  ],
  [
    Target,
    "Shared Dreams",
    "Ortak Hayaller",
    "Plan a future, then turn completed dreams into memories.",
    "Geleceği planlayın, gerçekleşen hayalleri anılara dönüştürün.",
    "/bucket-list",
  ],
] as const;
export default function Landing() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[94vh] px-5">
        <FloatingHearts count={10} />
        <LandingHeader />
        <div className="mx-auto grid max-w-7xl items-center gap-14 pb-20 pt-12 lg:grid-cols-[.9fr_1.1fr] lg:pt-16">
          <div className="relative z-10">
            <p className="eyebrow mb-5"><Bilingual en="Our little world, kept forever." tr="Küçük dünyamız, sonsuza dek saklı." /></p>
            <h1 className="max-w-2xl font-serif text-[clamp(3.4rem,7vw,6.8rem)] font-medium leading-[.92] tracking-[-.055em]">
              <Bilingual en="Your story deserves a place " tr="Hikâyeniz kendine ait " />
              <span className="italic text-wine"><Bilingual en="of its own." tr="bir yeri hak ediyor." /></span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-ink/62 sm:text-lg">
              <Bilingual en="Ourside is a private space for couples to keep photos, letters, milestones, and every little moment that becomes part of their story." tr="Ourside; çiftlerin fotoğraflarını, mektuplarını, dönüm noktalarını ve hikâyelerinin parçası olan tüm küçük anları saklayabildiği özel bir alandır." />
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PremiumButton href={appUrl("/signup")} className="px-8">
                <Bilingual en="Create Your Ourside" tr="Ourside'ınızı oluşturun" />
              </PremiumButton>
              <PremiumButton href="#about" variant="secondary">
                <Bilingual en="Explore the experience" tr="Deneyimi keşfedin" />
              </PremiumButton>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["K", "S", "M", "J"].map((x, i) => (
                  <div
                    key={x}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream text-xs font-bold text-white"
                    style={{
                      background: ["#71323c", "#c17f82", "#8c6b62", "#9b849f"][
                        i
                      ],
                    }}
                  >
                    {x}
                  </div>
                ))}
              </div>
              <p className="text-xs leading-5 text-ink/50">
                <strong className="block text-ink"><Bilingual en="Private by design" tr="Gizlilik için tasarlandı" /></strong>
                <Bilingual en="Every shared story stays between two." tr="Paylaşılan her hikâye iki kişi arasında kalır." />
              </p>
            </div>
          </div>
          <div className="relative mx-auto h-[470px] w-full max-w-[670px] sm:h-[540px]">
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-[#f2cfc8] via-[#eee3dc] to-[#dbd1e8] blur-3xl" />
            <div className="absolute left-[5%] top-10 z-10 w-[45%] -rotate-6 rounded-md bg-paper p-3 pb-12 shadow-warm">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={images[2]}
                  alt="A couple walking by the sea"
                  fill
                  className="object-cover"
                  sizes="(max-width: 639px) 42vw, 300px"
                  priority
                />
              </div>
              <p className="mt-3 font-serif text-lg italic">
                “The day we forgot the time.”
              </p>
            </div>
            <div className="absolute right-[3%] top-20 z-20 w-[49%] rotate-3 rounded-md bg-paper p-3 pb-4 shadow-warm">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={images[1]}
                  alt="A quiet moment together"
                  fill
                  className="object-cover"
                  sizes="(max-width: 639px) 46vw, 330px"
                  priority
                />
              </div>
              <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-ink/45">
                <span>Sunday morning</span>
                <span>Apr 13</span>
              </div>
            </div>
            <div className="paper-grid absolute bottom-3 left-[23%] z-30 w-[52%] -rotate-2 rounded-sm border bg-[#fffaf0] p-7 shadow-warm">
              <Heart className="mb-4 h-5 w-5 text-wine" fill="currentColor" />
              <p className="font-serif text-xl italic leading-8">
                “Let’s remember how ordinary and perfect this felt.”
              </p>
              <p className="mt-3 text-xs font-bold text-wine">— Sarah</p>
            </div>
            <div className="absolute bottom-16 right-3 z-40 rounded-full bg-wine px-4 py-2 text-xs font-bold text-white shadow-lg">
              427 days of us
            </div>
          </div>
        </div>
      </section>
      <section className="border-y bg-wine px-5 py-16 text-center text-white">
        <p className="font-serif text-3xl leading-tight sm:text-5xl">
          <Bilingual en="More than photos. More than messages." tr="Fotoğraflardan ve mesajlardan daha fazlası." />
        </p>
        <p className="mt-3 text-white/60"><Bilingual en="A place to remember what mattered." tr="Değerli olanı hatırlayacağınız bir yer." /></p>
      </section>
      <section id="about" className="px-5 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div><p className="eyebrow"><Bilingual en="What is Ourside?" tr="Ourside nedir?" /></p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl"><Bilingual en="A private world for " tr="Yalnızca " /><span className="italic text-wine"><Bilingual en="the two of you." tr="ikinize ait özel bir dünya." /></span></h2></div>
            <p className="max-w-2xl text-base leading-8 text-ink/60 sm:text-lg"><Bilingual en="Ourside brings your photos, notes, future letters, milestones, and shared plans into one quiet place. It is not a social feed. It is a personal timeline that only you and your partner can build and revisit." tr="Ourside; fotoğraflarınızı, notlarınızı, gelecek mektuplarınızı, dönüm noktalarınızı ve ortak planlarınızı sakin bir alanda birleştirir. Bir sosyal akış değil; yalnızca sizin ve partnerinizin oluşturup yeniden yaşayabildiği kişisel bir zaman çizelgesidir." /></p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [LockKeyhole, "Private by design", "Gizlilik için tasarlandı", "Only the two of you can enter.", "Yalnızca ikiniz erişebilirsiniz."],
              [Camera, "Keep moments together", "Anları birlikte saklayın", "Photos and the stories behind them stay connected.", "Fotoğraflar ve hikâyeleri bir arada kalır."],
              [TimerReset, "Write across time", "Zamana mektup bırakın", "Seal a letter for a date that matters.", "Önemli bir tarih için mektup mühürleyin."],
              [Target, "Shape what comes next", "Geleceği birlikte kurun", "Turn shared plans into memories when they happen.", "Ortak planları gerçekleştiğinde anıya dönüştürün."],
            ].map(([Icon, title, titleTr, text, textTr]) => <article key={title as string} className="rounded-[1.5rem] border bg-paper p-6 shadow-card"><span className="grid h-11 w-11 place-items-center rounded-full bg-wine/10 text-wine"><Icon className="h-5 w-5" /></span><h3 className="mt-6 font-serif text-2xl"><Bilingual en={title as string} tr={titleTr as string} /></h3><p className="mt-2 text-sm leading-6 text-ink/55"><Bilingual en={text as string} tr={textTr as string} /></p></article>)}
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto max-w-7xl px-5 py-28">
        <div className="max-w-2xl">
          <p className="eyebrow"><Bilingual en="Made for the two of you" tr="İkiniz için tasarlandı" /></p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">
            <Bilingual en="Everything worth keeping, " tr="Saklamaya değer her şey, " />
            <span className="italic text-wine"><Bilingual en="finally together." tr="nihayet bir arada." /></span>
          </h2>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, titleTr, text, textTr, href]) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-[1.6rem] border bg-paper p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-warm"
            >
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-rose/10 blur-2xl transition group-hover:bg-rose/25" />
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-wine/8 text-wine">
                <Icon />
              </div>
              <h3 className="mt-8 font-serif text-2xl"><Bilingual en={title} tr={titleTr} /></h3>
              <p className="mt-2 text-sm leading-6 text-ink/55"><Bilingual en={text} tr={textTr} /></p>
              <Link href={appUrl(href)} className="focus-ring mt-6 inline-flex items-center gap-1 rounded-md text-xs font-bold text-wine">
                <Bilingual en="Discover" tr="Keşfet" /> <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section id="story" className="relative bg-[#f3ebe5] px-5 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="eyebrow"><Bilingual en="Two lives. One story." tr="İki hayat. Tek hikâye." /></p>
            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl sm:text-6xl">
              <Bilingual en="Look back and see how " tr="Geriye bakın ve nasıl " />
              <span className="italic text-wine"><Bilingual en="you became you." tr="siz olduğunuzu görün." /></span>
            </h2>
          </div>
          <div className="relative mx-auto mt-16 max-w-4xl space-y-5">
            {[
              ["Apr 2025", "The coffee shop we kept going back to", "Her hafta döndüğümüz küçük kahveci", "A small ritual that quietly became ours.", "Sessizce bize ait olan küçük bir alışkanlık.", images[1]],
              ["Nov 2025", "Our first weekend trip", "İlk hafta sonu yolculuğumuz", "No itinerary, one shared playlist, and the wrong train.", "Plansız bir rota, ortak bir çalma listesi ve yanlış tren.", images[3]],
              ["Feb 2026", "The day we moved in", "Birlikte eve çıktığımız gün", "Keys on the table and boxes in every room.", "Masada anahtarlar, her odada kutular.", images[4]],
              ["Oct 2027", "A letter for our next anniversary", "Gelecek yıldönümümüze bir mektup", "Sealed today. Waiting for another chapter.", "Bugün mühürlendi. Yeni bir bölümü bekliyor.", images[5]],
            ].map((m) => (
              <div
                key={m[1]}
                className="group grid overflow-hidden rounded-[1.5rem] border bg-paper shadow-card md:grid-cols-[260px_1fr]"
              >
                <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-60">
                  {/* Ratio-based photo containers prevent distortion at mobile breakpoints. */}
                  <Image src={m[5]} alt={`Editorial memory: ${m[1]}`} fill sizes="(max-width: 767px) 100vw, 260px" className="object-cover transition duration-700 group-hover:scale-[1.035] motion-reduce:transition-none" />
                </div>
                <div className="flex min-h-52 flex-col justify-center p-7 text-left md:p-9">
                  <span className="eyebrow">{m[0]}</span>
                  <h3 className="mt-2 font-serif text-3xl"><Bilingual en={m[1]} tr={m[2]} /></h3>
                  <p className="mt-3 font-serif text-lg italic text-ink/50">
                    “<Bilingual en={m[3]} tr={m[4]} />”
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="vault" className="relative overflow-hidden px-5 py-28">
        <FloatingHearts count={6} />
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The Ourside Vault</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
              <Bilingual en="Write something today. " tr="Bugün bir şeyler yazın. " />
              <span className="italic text-wine">
                Open it when life feels different.
              </span>
            </h2>
            <p className="mt-6 max-w-xl leading-8 text-ink/55">
              Seal a letter for an anniversary, a hard day, or a version of you
              that hasn’t arrived yet.
            </p>
            <PremiumButton href={appUrl("/vault")} className="mt-8">
              Write a future letter
            </PremiumButton>
          </div>
          <div className="relative mx-auto w-full max-w-md rounded-[2rem] border bg-gradient-to-br from-paper to-[#f1d9d5] p-8 shadow-warm">
            <div className="absolute inset-x-8 top-1/2 h-px bg-wine/15" />
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-wine text-white shadow-xl shadow-wine/25">
              <LockKeyhole />
            </div>
            <p className="eyebrow mt-12">Sealed by Sarah</p>
            <h3 className="mt-2 font-serif text-3xl">For our next beginning</h3>
            <p className="mt-3 text-sm text-ink/50">Opens October 12, 2027</p>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                ["480", "days"],
                ["06", "hours"],
                ["14", "mins"],
              ].map((x) => (
                <div
                  key={x[1]}
                  className="rounded-xl bg-white/55 p-3 text-center"
                >
                  <strong className="block font-serif text-2xl">{x[0]}</strong>
                  <span className="text-[9px] uppercase tracking-wider text-ink/45">
                    {x[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PricingSection />
      <section className="mx-5 mb-8 overflow-hidden rounded-[2.5rem] bg-ink px-6 py-24 text-center text-white">
        <Sparkles className="mx-auto mb-6 text-rose" />
        <h2 className="font-serif text-4xl sm:text-6xl">
          <Bilingual en="Start saving your story together." tr="Hikâyenizi birlikte saklamaya başlayın." />
        </h2>
        <p className="mt-4 text-white/55">
          <Bilingual en="The best memories rarely announce themselves." tr="En güzel anılar genellikle kendini önceden belli etmez." />
        </p>
        <PremiumButton
          href={appUrl("/signup")}
          className="mt-8 bg-[#f4ded8] text-wine hover:bg-white"
        >
          Create Our Space
        </PremiumButton>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 text-sm text-ink/55 md:flex-row md:items-center md:justify-between">
        <Logo />
        <div className="flex flex-wrap gap-6">
          <a href="#features">Product</a>
          <Link href={marketingUrl("/privacy")}>Privacy</Link>
          <Link href={marketingUrl("/contact")}>Support</Link>
          <Link href={marketingUrl("/terms")}>Terms</Link>
        </div>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <span>© 2026 Ourside</span>
        </div>
      </footer>
    </main>
  );
}
