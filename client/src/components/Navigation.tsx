import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Menu, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/courses", label: "الدورات" },
    { href: "/quran", label: "حفظ القرآن" },
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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-reverse space-x-4 cursor-pointer">
              <div className="w-12 h-12 bg-islamic-green rounded-full flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-islamic-green font-arabic-serif">
                  بستان الإيمان
                </h2>
                <p className="text-sm text-gray-600">منصة التعليم الإسلامي</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-reverse space-x-8">
            <NavigationItems />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-reverse space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-reverse space-x-2"
                    data-testid="user-menu-trigger"
                  >
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
                        alt={(user as any)?.firstName || "المستخدم"} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-islamic-green rounded-full flex items-center justify-center">
                        <User className="text-white" size={16} />
                      </div>
                    )}
                    <span className="hidden sm:block">
                      {(user as any)?.firstName || "المستخدم"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
                    className="hidden sm:flex px-4 py-2 text-islamic-green hover:bg-islamic-green hover:text-white transition-colors rounded-lg border border-islamic-green"
                    data-testid="button-login"
                  >
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="btn-islamic-primary px-4 py-2"
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
                  <Menu className="text-islamic-green" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Logo in mobile menu */}
                  <div className="flex items-center space-x-reverse space-x-4 pb-4 border-b">
                    <div className="w-10 h-10 bg-islamic-green rounded-full flex items-center justify-center">
                      <BookOpen className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-islamic-green font-arabic-serif">
                        بستان الإيمان
                      </h3>
                      <p className="text-xs text-gray-600">منصة التعليم الإسلامي</p>
                    </div>
                  </div>

                  {/* Mobile Navigation Items */}
                  <div className="flex flex-col space-y-4">
                    <NavigationItems />
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="pt-4 border-t">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-reverse space-x-3 p-3 bg-light-beige rounded-lg">
                          {(user as any)?.profileImageUrl ? (
                            <img 
                              src={(user as any).profileImageUrl} 
                              alt={(user as any)?.firstName || "المستخدم"} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-islamic-green rounded-full flex items-center justify-center">
                              <User className="text-white" size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{(user as any)?.firstName || "المستخدم"}</p>
                            <p className="text-sm text-gray-600">{(user as any)?.email}</p>
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
                            className="btn-islamic-primary w-full"
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
