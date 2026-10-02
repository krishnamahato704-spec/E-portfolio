import Link from "@/components/portfolio-link";
export default function NotFound() {
  return (
    <div className="shell not-found">
      <p className="eyebrow">404 / Page not found</p>
      <h1>
        This page has
        <br />
        moved out of view.
      </h1>
      <p>The teaching work, research, and contact details are still here.</p>
      <Link className="button button-primary" href="/">
        Return to the portfolio ↗
      </Link>
    </div>
  );
}
