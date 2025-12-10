import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Menu, User, LogOut, ShoppingCart, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import bustanLogo from "@assets/bustan aleman logo_1762998406195.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Get cart items for students
  const { data: cartItems } = useQuery<any[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated && user?.role === 'student',
  });
  
  const cartItemsCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/courses", label: "الدورات" },
    { href: "/quran", label: "حفظ القرآن" },
    { href: "/students", label: "إدارة الطلاب" },
    { href: "/about", label: "من نحن" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const NavigationItems = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <button
            className={`nav-link ${isActive(item.href) ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
            data-testid={`nav-link-${item.href.slice(1) || "home"}`}
          >
            {item.label}
          </button>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-[hsl(var(--sidebar))] shadow-lg sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-4 cursor-pointer">
              <img 
                src={bustanLogo} 
                alt="بستان الإيمان" 
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-reverse space-x-8">
            <NavigationItems />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-reverse space-x-2 sm:space-x-4">
            <ThemeToggle />
            
            {/* Cart Button for Students */}
            {isAuthenticated && user?.role === 'student' && (
              <Link href="/cart">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  data-testid="button-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            {isAuthenticated && (
              <NotificationBell onClick={() => {}} />
            )}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center space-x-reverse space-x-2 px-2 sm:px-3"
                    data-testid="user-menu-trigger"
                  >
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
                        alt={(user as any)?.firstName || "المستخدم"} 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-islamic-green rounded-full flex items-center justify-center">
                        <User className="text-white" size={14} />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm">
                      {(user as any)?.firstName || "المستخدم"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user?.role === 'student' && (
                    <DropdownMenuItem asChild>
                      <Link href="/student">
                        <BookOpen className="ml-2 h-4 w-4" />
                        لوحة الطالب
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role === 'supervisor' || user?.role === 'teacher') && (
                    <DropdownMenuItem asChild>
                      <Link href="/teacher">
                        <BookOpen className="ml-2 h-4 w-4" />
                        لوحة المعلم
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role === 'admin' || user?.role === 'owner') && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <BookOpen className="ml-2 h-4 w-4" />
                        لوحة الإدارة
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="ml-2 h-4 w-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-courses">
                      <BookOpen className="ml-2 h-4 w-4" />
                      دوراتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex px-3 sm:px-4 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-primary))] hover:text-white transition-colors rounded-lg border border-[hsl(var(--sidebar-foreground))]"
                    data-testid="button-login"
                  >
                    <span className="text-sm">تسجيل الدخول</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    className="bg-btn text-btn-foreground hover:opacity-90 px-3 sm:px-4 text-xs sm:text-sm"
                    data-testid="button-register"
                  >
                    إنشاء حساب
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="text-[hsl(var(--sidebar-foreground))]" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Logo in mobile menu with Theme Toggle */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary font-arabic-serif">
                          بستان الإيمان
                        </h3>
                        <p className="text-xs text-muted-foreground">منصة التعليم الإسلامي</p>
                      </div>
                    </div>
                    <ThemeToggle />
                  </div>

                  {/* Mobile Navigation Items */}
                  <div className="flex flex-col space-y-4">
                    <NavigationItems />
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="pt-4 border-t">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-reverse space-x-3 p-3 bg-muted rounded-lg">
                          {(user as any)?.profileImageUrl ? (
                            <img 
                              src={(user as any).profileImageUrl} 
                              alt={(user as any)?.firstName || "المستخدم"} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <User className="text-white" size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{(user as any)?.firstName || "المستخدم"}</p>
                            <p className="text-sm text-muted-foreground">{(user as any)?.email}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => window.location.href = "/api/logout"}
                          variant="outline" 
                          className="w-full"
                          data-testid="mobile-button-logout"
                        >
                          <LogOut className="ml-2 h-4 w-4" />
                          تسجيل الخروج
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsOpen(false)}
                            data-testid="mobile-button-login"
                          >
                            تسجيل الدخول
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button 
                            className="bg-btn text-btn-foreground hover:opacity-90 w-full"
                            onClick={() => setIsOpen(false)}
                            data-testid="mobile-button-register"
                          >
                            إنشاء حساب
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
