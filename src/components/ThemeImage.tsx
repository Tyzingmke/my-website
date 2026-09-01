"use client";

type ThemeImageProps = {
  lightSrc?: string;
  darkSrc?: string;
  alt: string;
  className?: string;
};

export function ThemeImage({ lightSrc, darkSrc, alt, className }: ThemeImageProps) {
  if (!lightSrc && !darkSrc) return null;
  const fallback = lightSrc || darkSrc || "";

  return (
    <span className={`theme-image${className ? ` ${className}` : ""}`}>
      <img className="theme-image-light" src={fallback} alt={alt} />
      {darkSrc ? <img className="theme-image-dark" src={darkSrc} alt="" aria-hidden="true" /> : null}
    </span>
  );
}
