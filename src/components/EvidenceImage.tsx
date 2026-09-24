import { useState, type ImgHTMLAttributes } from 'react';
import dimensions from '../image-dimensions.json';

export function EvidenceImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  if (failedSource === props.src) return <span className="image-unavailable" role="img" aria-label={props.alt || 'Portfolio document'}>Preview unavailable. {props.alt}</span>;
  const key = props.src?.match(/assets\/[^?#]+/)?.[0];
  const size = key ? (dimensions as Record<string, {width:number; height:number; preview?:string}>)[key] : undefined;
  const small = size?.preview && props.src?.replace(key, size.preview);
  const sources = small ? `${small} 640w, ${props.src} ${size.width}w` : undefined;
  return <img decoding="async" width={size?.width} height={size?.height} srcSet={sources}
    sizes={/lightbox|modal/.test(props.className || '') ? '(max-width: 767px) 90vw, 70vw' : '(max-width: 767px) 90vw, 38vw'}
    {...props} onError={() => setFailedSource(props.src)} />;
}
