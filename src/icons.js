// Small decorative line icons. Meaning is supplied by the adjacent text.
const paths={
 book:'<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
 school:'<path d="M4 21V9h16v12M2 21h20M9 21v-6h6v6M8 9V5l4-3 4 3v4M7 12h1m8 0h1M7 16h1m8 0h1M12 5v1"/>',
 people:'<circle cx="12" cy="6" r="3"/><path d="M6 21v-5a6 6 0 0 1 12 0v5M3 10a3 3 0 0 0 0 6m18-6a3 3 0 0 1 0 6M2 21v-3m20 3v-3"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 chart:'<path d="M4 21V14h4v7m4 0V9h4v12m4 0V3h2v18M2 21h22"/>',
 cap:'<path d="m2 8 10-5 10 5-10 5-10-5Zm4 2v7c4 3 8 3 12 0v-7M22 8v8"/>',
 pin:'<path d="M19 9c0 6-7 13-7 13S5 15 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18M7 15h3m4 0h3"/>',
 file:'<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8m-8 4h8"/>',
 pen:'<path d="m15 3 6 6M3 21l2-7L17 2l5 5L10 19l-7 2Zm2-7 5 5"/>',
 mail:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 6 10 7L22 6"/>',
 download:'<path d="M12 2v13m-5-5 5 5 5-5M3 16v6h18v-6"/>',
 play:'<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4V8Z"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a19 19 0 0 1 0 20 19 19 0 0 1 0-20Z"/>',
 award:'<circle cx="12" cy="8" r="6"/><path d="m8 13-2 9 6-3 6 3-2-9"/>',
 print:'<path d="M6 8V2h12v6M6 18H3V9h18v9h-3M6 14h12v8H6v-8Zm11-3h1"/>'
};
export function icon(name){return `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.file}</svg>`;}
