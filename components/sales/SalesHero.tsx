import Image from "next/image";
import type { SalesPageHero, SalesPageVideo } from "@/types";

type Props = {
  hero: SalesPageHero;
  video: SalesPageVideo;
  instructorName: string | null;
};

export function SalesHero({ hero, video, instructorName }: Props) {
  return (
    <section style={{ background: "linear-gradient(135deg, var(--bg-base) 0%, #160830 60%, var(--bg-surface) 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          {instructorName && (
            <p
              className="text-xs font-medium uppercase tracking-widest mb-4"
              style={{ color: "var(--accent)" }}
            >
              {instructorName}
            </p>
          )}
          <h1
            className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {hero.subtitle}
            </p>
          )}
        </div>

        {/* Media */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl aspect-video relative"
          style={{ background: "var(--bg-elevated)" }}
        >
          {video?.url ? (
            <video
              src={video.url}
              controls
              poster={hero.thumbnailUrl ?? undefined}
              className="w-full h-full object-cover"
            />
          ) : hero.thumbnailUrl ? (
            <Image
              src={hero.thumbnailUrl}
              alt={hero.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "var(--bg-elevated)" }}
            >
              <svg
                className="w-20 h-20 opacity-20"
                style={{ color: "var(--accent)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
