'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

interface IZarvaMarkProps {
  readonly className?: string;
}

/** Refined Z monogram on ink plate — atelier gold mark. */
export function ZarvaMark({ className }: IZarvaMarkProps) {
  const uid = useId().replace(/:/g, '');
  const rim = `${uid}-rim`;
  const gold = `${uid}-gold`;
  const goldDeep = `${uid}-gold-deep`;
  const sheen = `${uid}-sheen`;

  return (
    <svg
      className={cn('block', className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={rim} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0D878" />
          <stop offset="0.4" stopColor="#C9A227" />
          <stop offset="1" stopColor="#8A7012" />
        </linearGradient>
        <linearGradient id={gold} x1="8" y1="7" x2="24" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3DF8A" />
          <stop offset="0.35" stopColor="#E0BC3E" />
          <stop offset="0.7" stopColor="#C9A227" />
          <stop offset="1" stopColor="#9A7A14" />
        </linearGradient>
        <linearGradient id={goldDeep} x1="22" y1="10" x2="10" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A88316" />
          <stop offset="1" stopColor="#6E5A0E" />
        </linearGradient>
        <linearGradient id={sheen} x1="6" y1="6" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF6C8" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#E8C766" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7.5" fill="#0A0D12" />
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="7.5"
        fill="none"
        stroke={`url(#${rim})`}
        strokeWidth="1.15"
      />
      <rect x="3" y="3" width="16" height="14" rx="5" fill={`url(#${sheen})`} opacity="0.2" />

      {/* Continuous block-Z, thin optical weight */}
      <path
        d="M9 8.75H23V11.55L12.2 20.45H23V23.25H9V20.45L19.8 11.55H9V8.75Z"
        fill={`url(#${gold})`}
      />
      <path
        d="M20.6 11.55 23 11.55 14.4 20.45h-2.2L20.6 11.55Z"
        fill={`url(#${goldDeep})`}
        opacity="0.5"
      />
      <path d="M9.15 8.9H22.85V9.65H9.15V8.9Z" fill="#FFF1B0" opacity="0.4" />
    </svg>
  );
}
