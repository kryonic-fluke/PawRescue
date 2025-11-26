import React, { useState } from "react";

interface SplineEmbedProps {
  url: string;
  title: string;
  height?: number | string;
  fallbackImage?: string;
}

const SplineEmbed: React.FC<SplineEmbedProps> = ({ url, title, height = 360, fallbackImage }) => {
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card">
      {!blocked ? (
        <iframe
          src={url}
          title={title}
          style={{ width: "100%", height: typeof height === 'number' ? `${height}px` : height, border: "0" }}
          onError={() => setBlocked(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
          allow="xr-spatial-tracking; fullscreen; autoplay"
        />
      ) : (
        <div className="flex items-center justify-center" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          {fallbackImage ? (
            <img src={fallbackImage} alt={`${title} 3D preview`} className="h-full object-cover" />
          ) : (
            <div className="text-muted-foreground text-sm">3D preview unavailable</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SplineEmbed;
