import { NAV_ITEMS } from "@/lib/constants";

export function getNavItemByUrl(pathname) {
  return NAV_ITEMS.find(item => item.href === pathname) || null;
}