import * as simpleIcons from "simple-icons";

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

const PLATFORM_MAP: Record<
  string,
  { icon: simpleIcons.SimpleIcon; color: string }
> = {
  Instagram: {
    icon: simpleIcons.siInstagram,
    color: "#E1306C",
  },
  "Twitter/X": {
    icon: simpleIcons.siX,
    color: "#FFFFFF",
  },
  TikTok: {
    icon: simpleIcons.siTiktok,
    color: "#FFFFFF",
  },
  YouTube: {
    icon: simpleIcons.siYoutube,
    color: "#FF0000",
  },
  Facebook: {
    icon: simpleIcons.siFacebook,
    color: "#1877F2",
  },
};

export function PlatformIcon({
  platform,
  size = 20,
  className = "",
}: PlatformIconProps) {
  const meta = PLATFORM_MAP[platform];
  if (!meta) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={meta.color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={platform}
    >
      <path d={meta.icon.path} />
    </svg>
  );
}

export function getPlatformColor(platform: string): string {
  return PLATFORM_MAP[platform]
    ? `#${PLATFORM_MAP[platform].icon.hex}`
    : "#94A3B8";
}
