
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { NAV_ITEMS, ADMIN_NAV_ITEM } from '@/lib/constants';
import { Separator } from './ui/separator';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
      <div className="mt-auto">
        <Separator className="my-2"/>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(ADMIN_NAV_ITEM.href)}
              tooltip={ADMIN_NAV_ITEM.title}
            >
              <Link href={ADMIN_NAV_ITEM.href}>
                <ADMIN_NAV_ITEM.icon />
                <span>{ADMIN_NAV_ITEM.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </div>
  );
}
