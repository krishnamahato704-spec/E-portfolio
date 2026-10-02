import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  name?:
    | "arrow"
    | "download"
    | "sun"
    | "moon"
    | "menu"
    | "close"
    | "file"
    | "mail"
    | "check"
    | "copy";
};
export function Icon({ name = "arrow", ...props }: Props) {
  const paths = {
    arrow: (
      <>
        <path d="M5 19 19 5M5 5h14v14" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />,
    menu: <path d="M4 7h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    file: (
      <>
        <path d="M14 2H5v20h14V7l-5-5Zm0 0v5h5M8 12h8m-8 4h6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
