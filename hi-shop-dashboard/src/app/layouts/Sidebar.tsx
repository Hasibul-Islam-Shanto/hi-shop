import { X, LogOut } from "lucide-react";
import { NavLink } from "@/shared/components/NavLink";
import { sidebarLinks } from "@/shared/constants/navigation";
import useLogout from "@/hooks/useLogout";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <>
      <aside className="hidden lg:flex w-52 shrink-0 bg-surface-container-low h-screen sticky top-0 flex-col p-3 ghost-border z-20">
        <SidebarContent onClose={onClose} />
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-surface-container-low p-3 ghost-border transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
};

const SidebarContent = ({ onClose }: { onClose: () => void }) => {
  const { handleLogout } = useLogout();
  const handleSignOut = () => {
    handleLogout();
  };

  return (
    <>
      <div className="flex items-center gap-2.5 mb-6 px-2 pt-1">
        <img src="/hi_shop_logo.svg" alt="hi-shop" className="h-10 w-10" />
        <div>
          <h2 className="text-sm font-bold text-on-surface leading-tight">
            Admin
          </h2>
          <p className="text-[10px] text-on-surface-variant">hi&#8209;shop</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === "/admin"}
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200"
            activeClassName="bg-primary/10 text-primary font-semibold"
          >
            <link.icon className="h-4 w-4 shrink-0" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-outline-variant/20">
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="text-on-surface-variant hover:text-destructive transition-colors px-2 py-3 flex items-center justify-between w-full cursor-pointer"
        >
          Logout
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
