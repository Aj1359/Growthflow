import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  Smartphone,
  AlertTriangle,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { WhatsAppSetupModal } from './WhatsAppSetupModal';

export function TopBar() {
  const { currentOrg, user, whatsAppStatus, updateWhatsAppStatusLocally } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const orgInitial = (currentOrg?.name || user?.email || 'G').charAt(0).toUpperCase();

  return (
    <>
      <header className="h-16 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 gap-4 z-10">
        {/* Search Bar matching Mockup */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, contacts..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
            />
          </div>
        </div>

        {/* Right Section: WhatsApp Status + Notifications + Profile Avatar */}
        <div className="flex items-center gap-3.5 ml-auto">
          {/* WhatsApp Integration Status */}
          {whatsAppStatus.isConnected ? (
            <div
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-2 text-xs text-teal-900 bg-teal-50/80 border border-teal-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-teal-100/60 transition shadow-xs"
              title="Click to view WhatsApp Business profile"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Smartphone size={14} className="text-teal-700" />
              <span className="font-semibold truncate max-w-[140px]">
                {whatsAppStatus.displayPhone || 'WhatsApp Active'}
              </span>
              <span className="text-[10px] bg-teal-200/60 text-teal-800 px-1.5 py-0.5 rounded font-medium hidden lg:inline">
                {whatsAppStatus.qualityRating || 'Online'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl font-semibold hover:bg-amber-100 transition animate-pulse shadow-xs"
            >
              <AlertTriangle size={14} className="text-amber-600" />
              <span>Connect WhatsApp →</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </div>

          {/* User Profile Avatar with Name (matching Mockup: P PlainMark Solutions) */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {orgInitial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[130px]">
                {currentOrg?.name || 'Workspace'}
              </p>
              <p className="text-[10px] text-gray-500 truncate max-w-[130px]">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* WhatsApp Credentials Modal */}
      <WhatsAppSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={(saved) => {
          updateWhatsAppStatusLocally({
            isConnected: true,
            displayPhone: saved.display_phone || saved.phone_number_id || 'Connected Number',
            verifiedName: saved.verified_name || 'Verified Business Account',
            qualityRating: saved.quality_rating || 'GREEN',
          });
        }}
      />
    </>
  );
}
