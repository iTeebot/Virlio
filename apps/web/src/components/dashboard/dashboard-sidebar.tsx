"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBrand } from "./brand-context";
import {
  LayoutDashboard,
  BarChart2,
  Sparkles,
  Flame,
  Layers,
  Image as ImageIcon,
  Bot,
  ShieldCheck,
  Users,
  Settings,
  Clock,
  FileText,
  AlertTriangle,
  ChevronRight,
  Globe,
  ExternalLink,
  Zap,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { currentBrand } = useBrand();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("virlio_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("virlio_sidebar_collapsed", String(next));
  };

  if (!currentBrand) return null;

  const brandId = currentBrand.id;

  const navItems = [
    { label: "Overview", href: `/dashboard/brands/${brandId}/overview`, icon: LayoutDashboard },
    { label: "Statistics", href: `/dashboard/brands/${brandId}/statistics`, icon: BarChart2 },
    { label: "Meme Studio", href: `/dashboard/brands/${brandId}/generate`, icon: Sparkles, highlight: true },
    { label: "Automation", href: `/dashboard/brands/${brandId}/automations`, icon: Zap, highlight: true },
    { label: "Social Connections", href: `/dashboard/brands/${brandId}/socials`, icon: Share2 },
    { label: "Memes", href: `/dashboard/brands/${brandId}/memes`, icon: Flame },
    { label: "Templates", href: `/dashboard/brands/${brandId}/templates`, icon: Layers },
    { label: "Media Library", href: `/dashboard/brands/${brandId}/media`, icon: ImageIcon },
    { label: "Brand AI", href: `/dashboard/brands/${brandId}/brand-ai`, icon: Bot },
    { label: "Verification", href: `/dashboard/brands/${brandId}/verification`, icon: ShieldCheck },
    { label: "Team Members", href: `/dashboard/brands/${brandId}/team`, icon: Users },
    { label: "Brand Settings", href: `/dashboard/brands/${brandId}/settings`, icon: Settings },
    { label: "Activity", href: `/dashboard/brands/${brandId}/activity`, icon: Clock },
    { label: "Audit Log", href: `/dashboard/brands/${brandId}/audit-log`, icon: FileText },
    { label: "Danger Zone", href: `/dashboard/brands/${brandId}/danger-zone`, icon: AlertTriangle, danger: true },
  ];

  const sidebarContent = (
    <aside
      className={`h-full bg-white border-r border-gray-200 flex flex-col justify-between py-4 px-3 select-none transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="space-y-4 overflow-y-auto scrollbar-none">
        {/* Brand Header Badge & Collapse Toggle */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {currentBrand.logo_url ? (
                  <img src={currentBrand.logo_url} alt={currentBrand.name} className="w-full h-full object-cover" />
                ) : (
                  currentBrand.name.slice(0, 2).toUpperCase()
                )}
              </div>

              <div className="truncate flex-1">
                <span className="block text-xs font-bold text-gray-900 truncate">{currentBrand.name}</span>
                <span className="text-[10px] text-gray-400 font-mono block truncate">@{currentBrand.slug}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCollapse}
              title="Collapse Sidebar"
              className="hidden lg:flex p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full py-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {currentBrand.logo_url ? (
                <img src={currentBrand.logo_url} alt={currentBrand.name} className="w-full h-full object-cover" />
              ) : (
                currentBrand.name.slice(0, 2).toUpperCase()
              )}
            </div>

            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand Sidebar"
              className="hidden lg:flex p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                } rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-2xs"
                    : item.highlight
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? "" : "gap-2.5"}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-white"
                        : item.highlight
                        ? "text-blue-600"
                        : item.danger
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Public Profile Link Footer */}
      <div className="pt-3 border-t border-gray-100">
        <a
          href={`/brands/${currentBrand.slug}`}
          target="_blank"
          rel="noreferrer"
          title={isCollapsed ? "Public Profile" : undefined}
          className={`flex items-center ${
            isCollapsed ? "justify-center p-2" : "justify-between p-2.5"
          } text-xs font-bold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200 hover:border-blue-200`}
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-gray-400" /> {!isCollapsed && "Public Page"}
          </span>
          {!isCollapsed && <ExternalLink className="w-3.5 h-3.5 text-gray-400" />}
        </a>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onMobileClose} />
          <div className="relative z-10 h-full bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
