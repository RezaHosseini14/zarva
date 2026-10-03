import { renderNotificationsPage } from '@/features/notifications/render-notifications-page';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  return renderNotificationsPage({ locale, tab: 'sent' });
}
