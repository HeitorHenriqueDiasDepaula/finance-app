import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Upload, List, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
  { icon: Home, label: 'Início', page: 'Home', path: '/' },
  { icon: Upload, label: 'Enviar', page: 'Upload', path: '/upload' },
  { icon: List, label: 'Transações', page: 'Transactions', path: '/transactions' },
  { icon: PieChart, label: 'Fechamento', page: 'MonthlyClose', path: '/monthly-close' },
];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conteúdo das páginas */}
      <div className="flex-1 pb-20">
        <Outlet />
      </div>

      {/* Menu inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = currentPath === path;

            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center w-16 h-full relative"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 w-12 h-1 bg-[#1E3A5F] rounded-b-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{ scale: active ? 1.1 : 1 }}
                  className={`p-1.5 rounded-xl ${
                    active ? 'text-[#1E3A5F]' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                <span
                  className={`text-[10px] mt-0.5 font-medium ${
                    active ? 'text-[#1E3A5F]' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {children}
    </div>
  );
}
