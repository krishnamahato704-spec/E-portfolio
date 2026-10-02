import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ContentProvider } from "@/components/content-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MotionSystem, PageEntrance } from "@/components/motion-system";
import { initialContent, canonical, basePath, linkedIn } from "@/lib/content";
import "./globals.css";

const serif = localFont({
  src: [
    {
      path: "../assets/fonts/source-serif-4-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/source-serif-4-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});
const inter = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(canonical),
  title: {
    default: "Krishna Mahato · History, Education & Research",
    template: "%s · Krishna Mahato",
  },
  description: initialContent.profile.summary,
  authors: [{ name: initialContent.profile.name }],
  icons: { icon: `${basePath}/assets/favicon.svg` },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#111820" },
  ],
};

const themeScript = `(function(){var d=document.documentElement,t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';try{var s=localStorage.getItem('portfolio-theme');if(s==='dark'||s==='light')t=s}catch(e){}d.dataset.theme=t})()`;
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: initialContent.profile.name,
  url: canonical,
  image: `${canonical}assets/portrait.webp`,
  description: initialContent.profile.summary,
  sameAs: [linkedIn],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body id="top">
        <ContentProvider>
          <MotionSystem>
            <Header />
            <PageEntrance>
              <main id="main" tabIndex={-1}>
                {children}
              </main>
            </PageEntrance>
            <Footer />
          </MotionSystem>
        </ContentProvider>
      </body>
    </html>
  );
}
