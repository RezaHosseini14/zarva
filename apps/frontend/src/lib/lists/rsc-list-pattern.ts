/**
 * Standard for App Router list hubs (ZARVA phase 5).
 *
 * 1. Page = async Server Component (`setRequestLocale`).
 * 2. Data = `serverApiFetch` from `@/lib/auth/server-api` (httpOnly cookies).
 * 3. Section = async child that fetches + renders a client list island, or ErrorState.
 * 4. Interactive table/filter stays `'use client'` and receives `rows` as props.
 * 5. Mock-only hubs stay RSC shells that pass mock rows until Nest endpoints exist.
 * 6. Do not enable Cache Components until a dedicated adoption pass.
 */

export const RSC_LIST_PATTERN_VERSION = 1;
