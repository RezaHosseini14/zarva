import localFont from 'next/font/local';

/**
 * Primary project font: Yekan Bakh
 * Supports Persian, Arabic, and Latin scripts.
 */
export const yekanBakh = localFont({
  src: [
    {
      path: '../fonts/yekan-bakh/yekan-bakh-regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/yekan-bakh/yekan-bakh-medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/yekan-bakh/yekan-bakh-semibold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/yekan-bakh/yekan-bakh-bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/yekan-bakh/yekan-bakh-extrabold.woff',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-yekan-bakh',
  display: 'swap',
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});
