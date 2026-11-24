import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import {
  Building2,
  Smartphone,
  AlertTriangle,
  Search,
  Bell,
  ChevronDown,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { WhatsAppSetupModal } from './WhatsAppSetupModal';

export function TopBar() {
  const navigate = useNavigate();
  const { currentOrg, user, whatsAppStatus, updateWhatsAppStatusLocally } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadInquiries = async () => {
    try {
      const res = await api.replies.list();
      const list = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) {
        setInquiries(list);
      }
    } catch {}
  };

  useEffect(() => {
    loadInquiries();
    const interval = setInterval(loadInquiries, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadInquiries = inquiries.filter((item: any) => !item.handled);
  const unreadCount = unreadInquiries.length;
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
              className="w-full pl-10 pr-4 py-2 bg-[#FAFAF8] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
            />
          </div>
        </div>

        {/* Right Section: WhatsApp Status + Notifications + Profile Avatar */}
        <div className="flex items-center gap-3.5 ml-auto">
          {/* WhatsApp Integration Status */}
          {whatsAppStatus.isConnected ? (
            <div
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-2.5 text-xs text-[#1E2B16] bg-emerald-50/90 border border-emerald-300 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-100/70 transition shadow-xs"
              title="WhatsApp Cloud API Connected (Fancy Jewellers)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <Smartphone size={14} className="text-emerald-800 shrink-0" />
              <div className="flex flex-col text-left leading-tight hidden sm:flex">
                <span className="font-bold text-gray-900 truncate max-w-[140px]">
                  {whatsAppStatus.verifiedName || currentOrg?.name || 'Fancy Jewellers'}
                </span>
                <span className="text-[10px] font-mono text-gray-500 truncate max-w-[140px]">
                  {whatsAppStatus.displayPhone || '+91 82408 88242'}
                </span>
              </div>
              <span className="font-mono text-gray-700 sm:hidden">
                {whatsAppStatus.displayPhone || '+91 82408 88242'}
              </span>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold hidden lg:inline tracking-wide">
                Active
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-1.5 text-xs text-[#1E2B16] bg-[#D4AF37]/20 border border-[#D4AF37]/50 px-3 py-1.5 rounded-xl font-bold hover:bg-[#D4AF37]/30 transition animate-pulse shadow-xs"
            >
              <AlertTriangle size={14} className="text-[#D4AF37]" />
              <span>Connect WhatsApp →</span>
            </button>
          )}

          {/* Notification Bell with Live Inquiries Badge & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl cursor-pointer transition focus:outline-none"
              title={unreadCount > 0 ? `${unreadCount} new customer inquiry!` : 'Customer Inquiries & Notifications'}
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : inquiries.length > 0 ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              ) : null}
            </button>

            {/* Notifications Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Customer Inquiries</h3>
                    <p className="text-[10px] text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} unread message(s)` : 'All inquiries up to date'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/replies');
                    }}
                    className="text-[11px] font-bold text-[#D4AF37] hover:text-[#B5952F] flex items-center gap-1 transition"
                  >
                    Open Inbox <ArrowRight size={12} />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {inquiries.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 space-y-1">
                      <MessageSquare size={24} className="mx-auto text-gray-300" />
                      <p className="text-xs font-medium text-gray-500">No customer inquiries yet</p>
                      <p className="text-[10px] text-gray-400">Incoming WhatsApp replies will appear here</p>
                    </div>
                  ) : (
                    inquiries.slice(0, 5).map((inq: any, i: number) => {
                      const senderName = inq.customer_name || inq.name || inq.from_e164 || inq.whatsapp_e164 || 'Customer';
                      const msgText = inq.body || inq.message || inq.text || 'Inquiry message';
                      const isUnread = !inq.handled;

                      return (
                        <div
                          key={inq.id || i}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/replies');
                          }}
                          className={`p-3.5 hover:bg-gray-50 cursor-pointer transition flex items-start gap-3 ${
                            isUnread ? 'bg-[#D4AF37]/5' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isUnread ? 'bg-[#2E3E24] text-[#D4AF37]' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {senderName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-gray-900 truncate max-w-[140px]">
                                {senderName}
                              </p>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 truncate mt-0.5">
                              {msgText}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1 font-mono">
                              {inq.received_at ? new Date(inq.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/replies');
                    }}
                    className="w-full py-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition"
                  >
                    View All Customer Chats →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Name (matching Mockup: P PlainMark Solutions) */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#1E2B16] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-black text-xs shadow-sm">
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
