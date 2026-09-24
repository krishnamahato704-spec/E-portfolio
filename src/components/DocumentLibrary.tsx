import { usePortfolioContent } from '../PortfolioContent';
import { assetUrl } from '../runtime';
import { EvidenceImage } from './EvidenceImage';
import { documentUrl, democracySource } from '../evidence';
import { imageUrl } from '../views';

export function DocumentLibrary() {
  const { resources } = usePortfolioContent();
  const files = resources.filter(item => item.url !== democracySource);
  if (!files.length) return null;
  return <div className="document-library" aria-labelledby="document-library-title">
    <p className="section-kicker">FROM MY FILES</p>
    <h3 id="document-library-title">Reports &amp; presentations</h3>
    <div className="document-grid">{files.map(item => <article className="document-card" key={item.url}>
      {(item.thumbnail || item.image) && <EvidenceImage src={imageUrl(item.thumbnail || item.image, assetUrl('assets/').replace(/assets\/$/, ''))} alt={item.title} loading="lazy" />}
      <div className="document-copy"><span>{item.type}</span><h4>{item.title}</h4><p>{item.description}</p>
        <a href={documentUrl(item.url, assetUrl('assets/').replace(/assets\/$/, ''))} target="_blank" rel="noopener noreferrer">Open original {item.url.endsWith('.pptx') ? 'PowerPoint' : 'file'} ↗</a>
      </div>
    </article>)}</div>
  </div>;
}
