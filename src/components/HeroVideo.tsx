import { useEffect, useRef, useState } from 'react';
import { assetUrl, usePageVisible } from '../runtime';

export function HeroVideo({ reducedMotion, lowPower, mobile }: {
  reducedMotion: boolean; lowPower: boolean; mobile: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(true);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const pageVisible = usePageVisible();
  // Phones, reduced motion and Save-Data start with the existing poster, without a video request.
  const posterOnly = reducedMotion || lowPower || mobile;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    const hero = document.getElementById('hero');
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!posterOnly && !paused && !failed && inView && pageVisible) {
      video.play().catch(() => setPaused(true));
    } else video.pause();
  }, [posterOnly, paused, failed, inView, pageVisible]);
  return <>
    <div className="hero-video-layer" aria-hidden="true" hidden={!inView}>
      <video ref={ref} muted loop playsInline autoPlay={!posterOnly} preload="none"
        poster={assetUrl('assets/hero-poster.webp')}
        src={!posterOnly && !failed ? assetUrl('assets/hero-video-opt.mp4') : undefined}
        onError={() => setFailed(true)} />
    </div>
    {!posterOnly && !failed && inView && <button className="video-toggle" type="button"
      onClick={() => setPaused(value => !value)} aria-pressed={paused}>
      {paused ? 'Play background video' : 'Pause background video'}
    </button>}
  </>;
}
