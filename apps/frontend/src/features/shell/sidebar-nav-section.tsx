import { SidebarNavLinks } from './sidebar-nav-links';
import { getShellNavigation } from './get-shell-navigation';

export async function SidebarNavSection() {
  let items: Awaited<ReturnType<typeof getShellNavigation>>['items'] = [];
  try {
    const navigation = await getShellNavigation();
    items = navigation.items;
  } catch {
    // Auth redirect is owned by requireUser; nav must not crash the shell.
  }
  return <SidebarNavLinks items={items} />;
}
