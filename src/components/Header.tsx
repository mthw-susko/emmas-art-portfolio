'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { user, login, logout } = useAuth();
  const pathname = usePathname();

  const handleNameClick = () => {
    setClickCount(prev => prev + 1);
  };

  useEffect(() => {
    if (clickCount === 3) {
      setShowLoginModal(true);
      setClickCount(0);
    }
    
    // Reset click count after 2 seconds
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    return () => clearTimeout(timer);
  }, [clickCount]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await login(email, password);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Work', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Instagram', href: 'https://www.instagram.com/emmasartalbum/', external: true },
  ];

  return (
    <>
      <header className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Artist Logo/Name */}
          <div className="text-center mb-6">
            <motion.div
              className="cursor-pointer select-none"
              onClick={handleNameClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/emma-fleming.png"
                alt="Emma Fleming"
                width={450}
                height={120}
                className="mx-auto max-w-full h-auto"
                priority
              />
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="text-center">
            <ul className="flex justify-center space-x-8 md:space-x-12">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-500 transition-colors duration-200 font-medium"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`transition-colors duration-200 font-medium ${
                        pathname === item.href
                          ? 'text-blue-500 border-b-2 border-blue-400'
                          : 'text-gray-500 hover:text-blue-500'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Admin Status */}
          {user && (
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">Admin Mode</span>
              <button
                onClick={handleLogout}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {loginError && (
                  <div className="text-red-600 text-sm text-center">{loginError}</div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Login
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
