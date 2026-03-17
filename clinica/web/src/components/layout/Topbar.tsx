import {
  PanelLeft,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";

export function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { logout } = useAuth();
  const { userProfile } = useUserProfile();

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <PanelLeft className="h-6 w-6" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <div className="flex-1">
        {/* This button is for desktop to collapse/expand the sidebar */}
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={toggleSidebar}>
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <div className="flex items-center gap-4">



        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {getInitials(userProfile?.nombre_completo)}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="font-medium">{userProfile?.nombre_completo}</div>
              <div className="text-xs text-muted-foreground">{userProfile?.carnet}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
