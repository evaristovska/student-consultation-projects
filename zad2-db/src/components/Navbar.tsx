import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, User as UserIcon, GraduationCap, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onRoleChange, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">StudentConsult</span>
      </div>

      <div className="flex items-center gap-6">
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(['student', 'teacher', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    currentUser.role === role
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <UserIcon className="w-5 h-5" />
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Изход"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
