import type { Metadata } from "next";
import { basePath } from "@/lib/content";
export const metadata: Metadata = {
  title: "Owner Studio",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="studio-shell">
      <iframe
        title="Portfolio owner studio"
        src={`${basePath}/admin/studio.html`}
        className="studio-frame"
      />
    </div>
  );
}
