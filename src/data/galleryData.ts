import { defaultContent } from '../content';
import imageDimensions from '../image-dimensions.json';
import { assetUrl } from '../runtime';
export interface GalleryItem {
  id: string;
  title: string;
  category: 'Teaching Practice' | 'Field Practice & Community' | 'Lesson Planning & TLM' | 'Research & Presentations' | 'Academic Foundations';
  image: string;
  fallbackImage: string;
  highResUrl: string;
  caption: string;
  context: string;
  date?: string;
  aspect: 'landscape' | 'portrait' | 'square';
  featured?: boolean;
  // 3D Spatial coordinates in the gallery corridor
  position3D: [number, number, number];
  rotation3D: [number, number, number];
  size3D: [number, number]; // [width, height]
  depthLayer: 'foreground' | 'midground' | 'background';
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: 'Academic' | 'Teaching' | 'Professional learning' | 'Presentation';
  image: string;
  fallbackImage: string;
  highResUrl: string;
  description: string;
  verifiedContext: string;
  position3D: [number, number, number];
}

const publicBase = 'https://krishnamahato704-spec.github.io/E-portfolio/';
export function localMedia(url: string) { return url?.startsWith(publicBase) ? assetUrl(url.slice(publicBase.length)) : assetUrl(url); }
export function textureMedia(url: string) {
  const key = url?.match(/assets\/[^?#]+/)?.[0];
  const preview = (imageDimensions as Record<string, {preview?:string}>)[key]?.preview;
  return preview ? url.replace(key, preview) : url;
}
function dimensions(url: string) {
  const key = url?.match(/assets\/[^?#]+/)?.[0];
  return (imageDimensions as Record<string, {width:number;height:number}>)[key] || {width:4,height:3};
}
export function galleryItems(content: typeof defaultContent): GalleryItem[] {
  return content.gallery.map((item, i) => {
    const src = localMedia(item.image);
    const size = dimensions(src);
    const ratio = size.width / size.height;
    return {...item, id:item.id || `gallery-${i}`, image:src, fallbackImage:src, highResUrl:src,
      caption:item.description || '', context:item.context || '', category:item.category || 'Teaching Practice',
      aspect:ratio>1.1?'landscape':ratio<.9?'portrait':'square', featured:i===0,
      position3D:[15.2+(i%6)*1.15, i<6?1.4:3.15, -2.1], rotation3D:[0,-.08,0],
      size3D:[Math.min(1.2,1.5*ratio),Math.min(1.5,1.2/ratio)], depthLayer:'midground'} as GalleryItem;
  });
}
export function certificates(content: typeof defaultContent): CertificateItem[] {
  return content.certificates.map((item,i)=>{
    const originalIndex = item.image.match(/certWall([1-4])_/)?.[1];
    const src = originalIndex ? assetUrl(`assets/certificate-${originalIndex}.webp`) : localMedia(item.image);
    return {...item, id:item.id || `cert-${i}`, image:src, fallbackImage:src, highResUrl:localMedia(item.url || item.image),
      verifiedContext:item.description, position3D:[12+(i%4)*.85,i<4?1.4:2.6,-2.4]} as CertificateItem;
  });
}
export const GALLERY_ITEMS = galleryItems(defaultContent);
export const CERTIFICATES_DATA = certificates(defaultContent);
export const GALLERY_CATEGORIES = ['All','Teaching Practice','Field Practice & Community','Lesson Planning & TLM','Research & Presentations','Academic Foundations'] as const;
export type GalleryCategoryFilter = (typeof GALLERY_CATEGORIES)[number];
