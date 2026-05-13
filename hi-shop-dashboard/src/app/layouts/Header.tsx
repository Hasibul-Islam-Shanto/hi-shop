import { Link, useLocation } from "react-router-dom";
import { Bell, Search, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageTitles } from "@/shared/constants/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { pathname } = useLocation();
  const pageTitle = pageTitles[pathname];

  return (
    <header className="sticky top-0 z-30 bg-surface-container-low/80 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between ghost-border">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-sm font-bold text-on-surface hover:text-primary transition-colors"
          >
            hi&#8209;shop
          </Link>
          {pageTitle && pageTitle !== "Dashboard" && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-outline-variant" />
              <span className="text-sm font-semibold text-on-surface-variant">
                {pageTitle}
              </span>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border w-64 ml-2">
          <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-on-surface-variant h-8 w-8 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <div className="h-7 w-7 rounded-full aurora-gradient flex items-center justify-center text-xs font-bold text-primary-foreground ml-1 cursor-pointer">
          EV
        </div>
      </div>
    </header>
  );
};

export default Header;
