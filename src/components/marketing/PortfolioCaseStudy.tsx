import { Bilingual } from "@/components/Bilingual";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { appUrl } from "@/config/brand";

const capabilities = [
  [
    "Private couple spaces",
    "Özel çift alanları",
    "Membership-aware access and partner invitations.",
    "Üyelik kontrollü erişim ve partner davetleri.",
  ],
  [
    "Memory product system",
    "Anı ürün sistemi",
    "Timeline, gallery, milestones, plans, and future letters.",
    "Zaman çizelgesi, galeri, dönüm noktaları, planlar ve gelecek mektupları.",
  ],
  [
    "Secure product architecture",
    "Güvenli ürün mimarisi",
    "Supabase Auth, RLS planning, private media, and admin tooling.",
    "Supabase Auth, RLS planlaması, özel medya ve yönetim araçları.",
  ],
  [
    "Web-first, mobile-ready",
    "Web öncelikli, mobile hazır",
    "Reusable services, types, permissions, and responsive flows.",
    "Yeniden kullanılabilir servisler, tipler, izinler ve responsive akışlar.",
  ],
] as const;

export function PortfolioCaseStudy() {
  return (
    <section id="case-study" className="border-y bg-paper px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">
              <Bilingual
                en="Portfolio case study"
                tr="Portfolyo vaka çalışması"
              />
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
              <Bilingual
                en="A private memory app concept "
                tr="Çiftler için özel bir anı uygulaması "
              />
              <span className="italic text-wine">
                <Bilingual en="for couples." tr="konsepti." />
              </span>
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">
            <Bilingual
              en="Ourside was designed as a full-stack private space for memories, letters, milestones, and shared plans. The work focused on emotional product design, secure invite-based onboarding, Supabase-backed architecture, and a responsive web experience prepared for future mobile clients."
              tr="Ourside; anılar, mektuplar, dönüm noktaları ve ortak planlar için full-stack özel bir alan olarak tasarlandı. Projede duygusal ürün tasarımı, güvenli davet tabanlı kullanıcı akışı, Supabase mimarisi ve gelecekteki mobil istemcilere hazır responsive web deneyimi ele alındı."
            />
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(([title, titleTr, text, textTr], index) => (
            <article
              key={title}
              className="rounded-[1.5rem] border bg-cream/45 p-6 shadow-card"
            >
              <span className="text-xs font-bold uppercase tracking-[.16em] text-wine">
                0{index + 1}
              </span>
              <h3 className="mt-5 font-serif text-2xl">
                <Bilingual en={title} tr={titleTr} />
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/55">
                <Bilingual en={text} tr={textTr} />
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-5 rounded-[1.5rem] border bg-cream/55 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="eyebrow">
              <Bilingual en="Technology" tr="Teknoloji" />
            </p>
            <p className="mt-2 font-serif text-2xl">
              Next.js · React · TypeScript · Tailwind CSS · Supabase · Vercel
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PremiumButton href={appUrl("/demo")}>
              <Bilingual en="Open interactive demo" tr="İnteraktif demoyu aç" />
            </PremiumButton>
            <PremiumButton href={appUrl("/login")} variant="secondary">
              <Bilingual en="Owner login" tr="Yönetici girişi" />
            </PremiumButton>
          </div>
        </div>
      </div>
    </section>
  );
}
