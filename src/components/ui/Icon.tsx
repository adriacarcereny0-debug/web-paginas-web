import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  sparkles: <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm6.5 8.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1ZM6 14l.8 1.9 1.9.8-1.9.8L6 19.4l-.8-1.9-1.9-.8 1.9-.8L6 14Z" />,
  smartphone: <><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M10.5 18.5h3" /></>,
  zap: <path d="M13 2.5 4.5 13.5H11l-.5 8 8.5-11H13l0-8Z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  shield: <path d="M12 2.8 4.8 5.8v5.4c0 4.4 3 8.2 7.2 9.9 4.2-1.7 7.2-5.5 7.2-9.9V5.8L12 2.8Z" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  handshake: <path d="M3.5 11.5 8 7l3 2.5 2-1.5 4.5 4.5-1.5 1.5-3-3M3.5 11.5l4 4.5 2-1.5 2 2 2-1.5 2 2 2.5-2.5" />,
  building: <><path d="M4 21V6.5A2.5 2.5 0 0 1 6.5 4h6A2.5 2.5 0 0 1 15 6.5V21" /><path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V21M2.5 21h19M7.5 8h4M7.5 12h4M7.5 16h4" /></>,
  cart: <><circle cx="9.5" cy="19.5" r="1.4" /><circle cx="17.5" cy="19.5" r="1.4" /><path d="M2.5 3.5h2.4l2.3 11.2h11l2-7.7H6.2" /></>,
  refresh: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 3.5V9h-5.5" />,
  layout: <><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M9.5 9.5V20" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevron: <path d="m9 5.5 6.5 6.5L9 18.5" />,
  arrow: <path d="M4.5 12h15m-6-6.5 6.5 6.5-6.5 6.5" />,
  mail: <><rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  whatsapp: <path d="M20 11.7A8 8 0 0 1 8.2 18.8L4 20l1.3-4.1A8 8 0 1 1 20 11.7Z" />,
  pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.2A2 2 0 0 0 9.5 21h5a2 2 0 0 0 2-1.8L17.5 7" /></>,
  edit: <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M16.5 5.2a3.5 3.5 0 0 1 0 6.6M17 14.2a6.2 6.2 0 0 1 4.2 5.8" /></>,
  file: <><path d="M6 2.8h7l5 5V21H6z" /><path d="M13 2.8V8h5" /></>,
  chart: <path d="M4 20V10m5 10V4m5 16v-7m5 7V8" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m4.5 18 5-5 4 4 3-2.5 4 3.5" /></>,
  inbox: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M3.5 13.5H9l1.2 2.2h3.6L15 13.5h5.5" /></>,
  logout: <path d="M15 8V5.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V16M10.5 12h10m-3-3.2L20.7 12l-3.2 3.2" />,
  download: <path d="M12 3.5v11m-4-4 4 4 4-4M4.5 19.5h15" />,
  filter: <path d="M3.5 5.5h17l-6.6 7.6v5.6l-3.8 2v-7.6L3.5 5.5Z" />,
  euro: <path d="M17.5 6.2a6.5 6.5 0 1 0 0 11.6M4.5 10h8M4.5 14h8" />,
  briefcase: <><rect x="3" y="7.5" width="18" height="12" rx="2.5" /><path d="M8.5 7.5V5.8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.7M3 12.5h18" /></>,
  calculator: <><rect x="4.5" y="2.8" width="15" height="18.4" rx="2.5" /><path d="M8 7h8M8 11.5h.01M12 11.5h.01M16 11.5h.01M8 15.5h.01M12 15.5h.01M16 15.5h.01M8 19h4" /></>,
  quote: <path d="M9.5 6.5C7 7.6 5.5 10 5.5 12.8c0 2.3 1.4 3.9 3.3 3.9 1.8 0 3-1.3 3-3 0-1.7-1.2-2.9-2.8-2.9-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.3l-1.4-1.1Zm8 0c-2.5 1.1-4 3.5-4 6.3 0 2.3 1.4 3.9 3.3 3.9 1.8 0 3-1.3 3-3 0-1.7-1.2-2.9-2.8-2.9-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.3l-1.4-1.1Z" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.4M12 16.8h.01" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5Z" /></>,
  rocket: <path d="M14 4.5c3.5 1 5.5 4 5.5 7.5 0 1.6-.6 3-1.6 4.1l-2.4-2.4M14 4.5C10.5 5.5 7.5 8.5 6 12l3 3M14 4.5l-5 10.5M6 15l-1.5 4.5L9 18M9.5 11.5h.01" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeoff: <path d="M4 4l16 16M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.4 4.2M6.4 7.8A16.4 16.4 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6M10 10a2.8 2.8 0 0 0 4 4" />,
};

export type IconName = keyof typeof paths | string;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const d = paths[name] ?? paths.layout;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {d}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(paths);
