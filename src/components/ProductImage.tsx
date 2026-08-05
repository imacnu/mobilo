import Image from 'next/image';

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain';
  onClick?: () => void;
};

export default function ProductImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  sizes,
  priority,
  objectFit = 'cover',
  onClick,
}: ProductImageProps) {
  if (src.startsWith('blob:')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob URLs are not supported by next/image
      <img src={src} alt={alt} className={className} onClick={onClick} />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? '(max-width: 768px) 100vw, 33vw'}
        priority={priority}
        onClick={onClick}
        style={{ objectFit }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      priority={priority}
      onClick={onClick}
      style={{ objectFit }}
    />
  );
}
