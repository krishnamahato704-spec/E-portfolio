import { useState, type ImgHTMLAttributes } from 'react';

export function EvidenceImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  if (failedSource === props.src) return <span className="image-unavailable" role="img" aria-label={props.alt || 'Portfolio document'}>Preview unavailable. {props.alt}</span>;
  return <img {...props} onError={() => setFailedSource(props.src)} />;
}
