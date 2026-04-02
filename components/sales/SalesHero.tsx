import Image from "next/image";
import type { SalesPageHero, SalesPageVideo } from "@/types";

type Props = {
  hero: SalesPageHero;
  video: SalesPageVideo;
  instructorName: string | null;
};

export function SalesHero({ hero, video, instructorName }: Props) {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          {instructorName && (
            <p className="text-indigo-300 text-sm font-medium uppercase tracking-widest mb-4">
              {instructorName}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="text-lg text-gray-300 leading-relaxed">
              {hero.subtitle}
            </p>
          )}
        </div>

        {/* Media */}
        <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-800 relative">
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-800">
              <svg className="w-20 h-20 text-indigo-200 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
