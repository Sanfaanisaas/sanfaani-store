"use client";

import React, { ElementType } from "react";
import { LogOut } from "lucide-react";

export interface SidebarLink {
  label: string;
  icon: ElementType;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  title?: string;
  sidebarLinks?: SidebarLink[]; // Made optional to prevent crashes
  onLogout?: () => void;
}

export default function Sidebar({
  title = "My Account",
  sidebarLinks = [], // 👈 Default fallback to an empty array
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className="
        hidden
        w-64
        shrink-0
        border-r
        border-navy-900/10
        lg:sticky
        lg:top-0
        lg:flex
        lg:h-screen
        lg:flex-col
        bg-navy-900
        text-white
      "
    >
      <div className="px-6 py-8">
        <p className="text-lg font-bold">{title}</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {/* Safe mapping with fallback */}
        {sidebarLinks?.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-medium
              transition
              ${
                active
                  ? "bg-paper text-gold font-semibold shadow-sm"
                  : "text-mist hover:bg-paper hover:text-ink"
              }
            `}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-8">
        <div className="my-2 h-px bg-navy-900/10" />

        <button
          type="button"
          onClick={onLogout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-medium
            text-mist
            transition
            hover:bg-paper
            hover:text-ink
          "
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}