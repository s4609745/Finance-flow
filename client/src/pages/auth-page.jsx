import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign } from 'lucide-react';
import { COUNTRIES, CURRENCIES } from '@shared/currency';

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'US',
    currency: 'USD',
  });

  React.useEffect(() => {
    if (!isLoading && user) {
      setLocation('/');
    }
  }, [isLoading, user, setLocation]);

  if (!isLoading && user) {
    return null;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="flex w-[200%] h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: activeTab === 'login' ? 'translateX(0%)' : 'translateX(-50%)'
        }}
      >
        {/* Login Layout */}
        <div className="w-1/2 flex min-h-screen">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ExpenseTracker Pro
                </h1>
                <p className="text-gray-600 mt-2">
                  Take control of your finances
                </p>
              </div>

              <div className="w-full">
                <div className="grid w-full grid-cols-2 mb-6">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`py-2 px-4 text-sm font-medium rounded-l-md border ${activeTab === 'login'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${activeTab === 'register'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Sign Up
                  </button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-8 text-white">
            <div className="max-w-md text-center space-y-6">
              <h2 className="text-4xl font-bold">Welcome Back!</h2>
              <p className="text-xl opacity-90">
                Continue your financial journey with our comprehensive expense tracking platform.
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Real-time expense tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Beautiful analytics and insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Secure and private</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Multiple categories and customization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Register Layout */}
        <div className="w-1/2 flex min-h-screen">
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-indigo-700 items-center justify-center p-8 text-white">
            <div className="max-w-md text-center space-y-6">
              <h2 className="text-4xl font-bold">Join Us Today!</h2>
              <p className="text-xl opacity-90">
                Start your financial journey with our comprehensive expense tracking platform.
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Real-time expense tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Beautiful analytics and insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Secure and private</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Multiple categories and customization</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ExpenseTracker Pro
                </h1>
                <p className="text-gray-600 mt-2">
                  Take control of your finances
                </p>
              </div>

              <div className="w-full">
                <div className="grid w-full grid-cols-2 mb-6">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`py-2 px-4 text-sm font-medium rounded-l-md border ${activeTab === 'login'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`py-2 px-4 text-sm font-medium rounded-r-md border-t border-r border-b ${activeTab === 'register'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Sign Up
                  </button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Start tracking your expenses today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">First Name</Label>
                          <Input
                            id="register-firstName"
                            type="text"
                            placeholder="John"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">Last Name</Label>
                          <Input
                            id="register-lastName"
                            type="text"
                            placeholder="Doe"
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                        <p className="text-sm text-gray-500">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-country">Country</Label>
                          <Select 
                            value={registerData.country} 
                            onValueChange={(value) => {
                              const country = COUNTRIES.find(c => c.code === value);
                              setRegisterData({ 
                                ...registerData, 
                                country: value,
                                currency: country?.currency || 'USD'
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-currency">Currency</Label>
                          <Select 
                            value={registerData.currency} 
                            onValueChange={(value) => setRegisterData({ ...registerData, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CURRENCIES).map(([code, currency]) => (
                                <SelectItem key={code} value={code}>
                                  {currency.symbol} {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}