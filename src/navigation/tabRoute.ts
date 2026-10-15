import type { TabId } from "../components/BottomNav";

// intoss://zero-spend/{경로} 로 열면 해당 탭이 바로 열려요.
const TAB_PATHS: Record<TabId, string> = {
  home: "/",
  calendar: "/calendar",
  report: "/report",
  settings: "/settings",
};

export function tabFromPath(pathname: string): TabId {
  const normalized = `/${pathname.toLowerCase().replace(/^\/+|\/+$/g, "")}`;
  const match = (Object.keys(TAB_PATHS) as TabId[]).find(
    (tab) => TAB_PATHS[tab] === normalized,
  );
  return match ?? "home";
}

export function pathForTab(tab: TabId): string {
  return TAB_PATHS[tab];
}
