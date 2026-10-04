export default function Image({ src, alt, fill, priority, sizes, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string; [k: string]: unknown }) {
  void priority; void sizes;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined} {...(rest as object)} />;
}
