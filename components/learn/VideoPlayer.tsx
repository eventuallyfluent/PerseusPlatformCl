type Props = {
  src: string;
  title: string;
};

export function VideoPlayer({ src, title }: Props) {
  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-xl">
      <div className="aspect-video">
        <video
          src={src}
          title={title}
          controls
          controlsList="nodownload"
          className="w-full h-full object-contain"
          autoPlay={false}
          playsInline
        >
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  );
}
