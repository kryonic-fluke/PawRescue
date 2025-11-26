import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  AlertTriangle,
  Users,
  Search,
  Settings,
  MapPin,
  LogIn,
  User,
  Home,
  FileText,
  DollarSign,
  Package,
  Calculator,
  Navigation2,
  BookmarkPlus,
  Filter,
  PawPrint as PawPrintIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserButtonComponent from "./UserButton";

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  protected?: boolean;
};

type Feature = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sectionId?: string;
  tab?: string;
};

const pageFeatures: Record<string, Feature[]> = {
  "/": [
    { label: "Hero & Stats", icon: Home, sectionId: "hero" },
    { label: "How It Works", icon: FileText, sectionId: "features" },
    { label: "Quick Actions", icon: AlertTriangle, sectionId: "quick-actions" },
  ],
  "/adopt": [
    { label: "Browse Pets", icon: Search, sectionId: "browse-pets" },
    { label: "Filter & Search", icon: Filter, sectionId: "filters" },
    { label: "Pet Profiles", icon: PawPrintIcon, sectionId: "pet-list" },
    { label: "Cost Calculator", icon: Calculator, sectionId: "cost-calculator" },
  ],
  "/report": [
    { label: "Report Form", icon: FileText, sectionId: "report-form" },
    { label: "Upload Photos", icon: User, sectionId: "photo-upload" },
    { label: "Track Reports", icon: MapPin, sectionId: "track-reports" },
  ],
  "/live-map": [
    { label: "City Selection", icon: MapPin, sectionId: "city-selector" },
    { label: "NGO Locations", icon: Users, sectionId: "ngo-list" },
    { label: "Directions", icon: Navigation2, sectionId: "map-view" },
    { label: "Save & Share", icon: BookmarkPlus, sectionId: "actions" },
  ],
  "/favorites": [
    { label: "Saved Pets", icon: Heart, sectionId: "saved-pets" },
    { label: "Adoption List", icon: PawPrintIcon, sectionId: "adoption-list" },
  ],
  "/ngo-dashboard": [
    { label: "Rescue Reports", icon: AlertTriangle, tab: "reports" },
    { label: "Our Animals", icon: PawPrintIcon, tab: "animals" },
    { label: "Adoptions", icon: Package, tab: "adoptions" },
    { label: "Team", icon: Users, tab: "team" },
    { label: "Pet Rehoming", icon: Home, tab: "rehoming" },
    { label: "Donations", icon: DollarSign, tab: "donations" },
  ],
};

export default function Navigation(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  const navItems = [
    { path: "/", label: "Home", icon: Home, protected: false },
    { path: "/adopt", label: "Find Pet", icon: Search, protected: false },
    { path: "/report", label: "Report", icon: AlertTriangle, protected: false },
    { path: "/live-map", label: "Live Map", icon: MapPin, protected: false },
    { path: "/favorites", label: "Favorites", icon: Heart, protected: false },
    { path: "/ngo-dashboard", label: "NGO Portal", icon: Users, protected: true },
  ] as const;

  const isActive = (path: string) => location.pathname === path;

  const handleFeatureClick = (path: string, sectionId?: string, tab?: string) => {
    setHoveredItem(null);
    if (tab) {
      navigate(`${path}?tab=${tab}`);
      return;
    }
    if (location.pathname === path && sectionId) {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(path);
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <PawPrintIcon className="h-6 w-6" />
            <span className="font-bold">PawRescue</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon, protected: isProtected }) => {
              if (isProtected && !isSignedIn) return null;

              return (
                <div
                  key={path}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to={path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(path) ? "bg-accent text-accent-foreground" : "text-foreground/80"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>

                  {hoveredItem === path && pageFeatures[path] && (
                    <div className="absolute left-0 mt-1 z-50 animate-in fade-in-0 zoom-in-95">
                      <div className="bg-popover border rounded-md shadow-lg p-2 min-w-[200px] overflow-hidden">
                        <h3 className="text-xs font-semibold px-2 py-1.5">Features</h3>
                        <div className="space-y-1">
                          {pageFeatures[path].map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleFeatureClick(path, feature.sectionId, feature.tab)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                              >
                                <FeatureIcon className="h-3.5 w-3.5" />
                                {feature.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <ModeToggle />
            
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <UserButtonComponent />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/sign-out")}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-2 space-y-1">
            {navItems.map(({ path, label, icon: Icon, protected: isProtected }) => {
              if (isProtected && !isSignedIn) return null;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                    isActive(path) ? "bg-accent text-accent-foreground" : "text-foreground/80 hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}