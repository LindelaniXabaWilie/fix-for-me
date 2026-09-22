// src/components/ServiceIcon.tsx
import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  plumbing: (
    <>
      <path d="M3 7h5v5a4 4 0 0 0 4 4h9" />
      <path d="M3 4v6" />
      <path d="M18 13h3v6" />
    </>
  ),
  electrical: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  moving: (
    <>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
    </>
  ),
  handyman: (
    <path d="M20.5 5.5a4.5 4.5 0 0 1-5.9 5.9L6 20l-2-2 8.6-8.6a4.5 4.5 0 0 1 5.9-5.9l-3 3 2 2 3-3z" />
  ),
  hvac: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-3 1-6 3-6s2 4-1 6" />
      <path d="M14 12c3 0 6 1 6 3s-4 2-6-1" />
      <path d="M12 14c0 3-1 6-3 6s-2-4 1-6" />
      <path d="M10 12c-3 0-6-1-6-3s4-2 6 1" />
    </>
  ),
  appliance: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="14" r="4" />
      <path d="M8 7h.01M11 7h.01" />
    </>
  ),
  cleaning: (
    <>
      <path d="M12 3l1.7 4.4 4.4 1.7-4.4 1.7L12 15.2l-1.7-4.4L5.9 9.1l4.4-1.7L12 3Z" />
      <path d="M18 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </>
  ),
  painting: (
    <>
      <rect x="3" y="4" width="12" height="5" rx="1" />
      <path d="M15 6.5h3a2 2 0 0 1 2 2V10a2 2 0 0 1-2 2h-6v3" />
      <rect x="10" y="15" width="4" height="6" rx="1" />
    </>
  ),
  carpentry: (
    <>
      <path d="M3 14l7-7 4 4-7 7H3v-4z" />
      <path d="M14 7l3-3 4 4-3 3" />
      <path d="M6 17l1-1M8 15l1-1M10 13l1-1" />
    </>
  ),
  locksmith: (
    <>
      <circle cx="7.5" cy="7.5" r="4.5" />
      <path d="M10.8 10.8 21 21" />
      <path d="M17 17l2-2" />
      <path d="M19.5 19.5l2-2" />
    </>
  ),
  pest: (
    <>
      <circle cx="12" cy="13" r="5" />
      <path d="M12 8V5" />
      <path d="M8.5 10 5.5 7M15.5 10l3-3M7 13H3M17 13h4M8.5 16l-3 3M15.5 16l3 3" />
    </>
  ),
  roofing: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
}

type Props = {
  id: string
  size?: number
}

export default function ServiceIcon({ id, size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}