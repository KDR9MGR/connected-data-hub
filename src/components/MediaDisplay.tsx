import { parseYoutubeId, isVideoFile } from "@/lib/youtube";

export function MediaDisplay({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const ytId = parseYoutubeId(url);
  if (ytId) {
    return (
      <div className={`relative w-full aspect-video overflow-hidden ${className ?? ""}`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title={alt}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }
  if (isVideoFile(url)) {
    return <video src={url} controls className={className} />;
  }
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}
