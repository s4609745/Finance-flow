import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { DollarSign, Plus, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onAddTransaction?: () => void;
}

export default function Navbar({ onAddTransaction }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FinanceFlow</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`${location === '/' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`${location === '/transactions' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
                Transactions
              </a>
            </Link>
            <Link href="/analytics">
              <a className={`${location === '/analytics' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
                Analytics
              </a>
            </Link>
            <Link href="/categories">
              <a className={`${location === '/categories' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
                Categories
              </a>
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin">
                <a className={`${location === '/admin' ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
                  Admin
                </a>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {onAddTransaction && (
              <Button onClick={onAddTransaction} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover" 
                  />
                  <span className="hidden sm:block">{user?.firstName || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
