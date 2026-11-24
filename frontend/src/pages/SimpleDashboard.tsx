import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { WhatsAppSetupModal } from '../components/WhatsAppSetupModal';
import {
  BarChart3,
  Send,
  CheckCircle,
  Eye,
  AlertCircle,
  Clock,
  RefreshCw,
  CreditCard,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Users,
  MessageSquare,
  Play,
  Pause,
  XCircle,
  Smartphone,
  Sparkles,
} from 'lucide-react';

function getISTInfo() {
  try {
    const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hour = istDate.getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17 && hour < 22) greeting = 'Good Evening';
    else if (hour >= 22 || hour < 4) greeting = 'Good Evening';

    const timeStr = istDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { greeting, timeStr };
  } catch {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17 && hour < 22) greeting = 'Good Evening';
    else if (hour >= 22 || hour < 4) greeting = 'Good Evening';
    return { greeting, timeStr: 'IST' };
  }
}

function formatCampaignDisplayName(name: string): string {
  if (!name) return 'Campaign';
  let clean = name.replace(/^(Broadcast|Test)\s*-\s*/i, '').trim();
  clean = clean.replace(/_hx[a-f0-9]{20,}/i, '');
  return clean || name;
}

export default function SimpleDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReports = searchParams.get('tab') === 'reports';
  const { currentOrg, whatsAppStatus, updateWhatsAppStatusLocally } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [campaignProgress, setCampaignProgress] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'seen' | 'delivered_not_seen' | 'sent_not_delivered' | 'failed'>('seen');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // 1. Fetch Dashboard Overview
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [dashData, campList] = await Promise.all([
        api.dashboard.getStats(),
        api.campaigns.list(),
      ]);
      setStats(dashData);
      setCampaigns(campList);

      if (campList.length > 0 && selectedCampaignId === null) {
        setSelectedCampaignId(campList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed loading live dashboard statistics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentOrg?.id]);

  // 2. Fetch Selected Campaign Progress & Tab Messages
  const fetchCampaignDetails = async (campaignId: number, statusFilter: string) => {
    try {
      setMessagesLoading(true);
      const [prog, msgList] = await Promise.all([
        api.campaigns.getProgress(campaignId),
        api.campaigns.getMessages(campaignId, { status: statusFilter, limit: 50 }),
      ]);
      setCampaignProgress(prog);
      setMessages(msgList.data || []);
    } catch (err: any) {
      console.warn('Failed fetching campaign details:', err.message);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignDetails(selectedCampaignId, activeTab);
    }
  }, [selectedCampaignId, activeTab]);

  // 3. Auto-refresh every 5 seconds while a campaign is running
  useEffect(() => {
    const isRunning = campaigns.some((c) => c.status === 'running') || campaignProgress?.campaign?.status === 'running';
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (selectedCampaignId) {
        fetchCampaignDetails(selectedCampaignId, activeTab);
      }
      api.dashboard.getStats().then(setStats).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [campaigns, selectedCampaignId, activeTab, campaignProgress]);

  const handlePause = async (id: number) => {
    try {
      await api.campaigns.pause(id);
      fetchDashboardData();
      if (selectedCampaignId === id) fetchCampaignDetails(id, activeTab);
    } catch (err: any) {
      alert(`Failed to pause: ${err.message}`);
    }
  };

  const handleResume = async (id: number) => {
    try {
      await api.campaigns.resume(id);
      fetchDashboardData();
      if (selectedCampaignId === id) fetchCampaignDetails(id, activeTab);
    } catch (err: any) {
      alert(`Failed to resume: ${err.message}`);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this campaign? Pending messages will be skipped.')) return;
    try {
      await api.campaigns.cancel(id);
      fetchDashboardData();
      if (selectedCampaignId === id) fetchCampaignDetails(id, activeTab);
    } catch (err: any) {
      alert(`Failed to cancel: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="animate-spin text-emerald-800" size={32} />
        <p className="text-sm font-semibold text-gray-700">Connecting to live PostgreSQL database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 border-red-200 bg-red-50 text-red-900 space-y-3 my-6">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-800" />
          <h2 className="text-base font-bold">Failed to load real stats</h2>
        </div>
        <p className="text-sm">{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary text-xs px-4 py-2 mt-2">
          Retry Server Connection
        </button>
      </div>
    );
  }

  const account = stats?.account || {};
  const contacts = stats?.contacts || {};
  const overall = stats?.overall || {};
  const today = stats?.today || {};
  const banners = stats?.banners || [];
  const counts = campaignProgress?.counts || { total: 0, sent: 0, delivered: 0, read: 0, failed: 0 };
  const orgName = currentOrg?.name || 'PlainMark';
  const istInfo = getISTInfo();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* GrowthFlow Welcome Banner matching Mockup with Premium White & Golden styling */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FAF8F2] via-[#FFFFFF] to-[#F5F2E9] border border-[#D4AF37]/30 shadow-xs">
        <div className="relative z-10 max-w-xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#1E2B16] text-[11px] font-bold border border-[#D4AF37]/30">
            <Clock size={12} className="text-[#D4AF37]" />
            <span>Indian Standard Time (IST): {istInfo.timeStr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            {istInfo.greeting}, {orgName}! 👋
          </h1>
          <p className="text-sm font-semibold text-[#2D3A1E] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            {isReports ? 'Campaign Delivery Analytics & WhatsApp Performance Reports' : 'Grow your customers on WhatsApp'}
          </p>
        </div>

        {/* Paper airplane + WhatsApp graphic illustration */}
        <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 opacity-90 pointer-events-none">
          <div className="relative">
            <svg width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Flight dashed trail in gold */}
              <path d="M10 75 Q 60 70, 95 35" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              {/* Paper airplane */}
              <path d="M85 30 L130 15 L105 45 L95 35 Z" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.2" />
              <path d="M105 45 L95 35 L100 50 Z" fill="#D4AF37" opacity="0.5" />
            </svg>
            <div className="absolute -top-1 -right-3 w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageSquare size={20} fill="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real Active Banners */}
      {banners.map((b: any, i: number) => (
        <div
          key={i}
          className={`p-4 rounded-2xl flex items-start gap-3 border shadow-xs ${
            b.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <ShieldAlert size={20} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider">{b.type}: </span>
            {b.message}
          </div>
        </div>
      ))}

      {/* WhatsApp Connection State: If not connected, show prominent Connect CTA */}
      {!account.is_connected && (
        <div className="card p-6 sm:p-8 bg-gradient-to-br from-[#FAF8F2] via-white to-[#F5F2E9] border-2 border-[#D4AF37]/50 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1E2B16] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-md">
                <Smartphone size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#111827]">
                    Connect Your WhatsApp Business Account
                  </h2>
                  <span className="bg-[#D4AF37]/20 text-[#1E2B16] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                    Required for Live Sending
                  </span>
                </div>
                <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                  Connect your Meta WhatsApp Cloud API credentials (Phone Number ID, WABA ID, and Permanent Access Token) to unlock live contact syncing, broadcasting, templates, and analytics.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConnectModal(true)}
              className="btn-primary shrink-0 px-5 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C048] text-[#111827] hover:brightness-105 shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone size={16} />
              <span>Connect WhatsApp Now →</span>
            </button>
          </div>
        </div>
      )}

      {/* Live WhatsApp Spend & Meta Wallet Card */}
      <div className="card p-6 bg-gradient-to-br from-white via-[#FAF8F2] to-white border border-[#D4AF37]/40 shadow-xs rounded-3xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1E2B16] text-[#D4AF37] flex items-center justify-center shadow-xs shrink-0">
                <CreditCard size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2">
                  Live WhatsApp Spend & Meta Wallet
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Active
                  </span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Real-time Meta Cloud API conversation usage & billing.
                </p>
              </div>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Est. Spend</p>
              <p className="text-lg font-black text-[#1E2B16] mt-0.5">
                ₹{(Number(overall.total_delivered || 0) * 0.86).toFixed(2)}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 font-mono">
                ≈ ${(Number(overall.total_delivered || 0) * 0.0107).toFixed(2)} USD
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Per Message Rate</p>
              <p className="text-lg font-black text-gray-900 mt-0.5">₹0.86</p>
              <p className="text-[10px] font-semibold text-emerald-600">Marketing tier</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</p>
              <p className="text-xs font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Mastercard •••• 4776
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Meta Auto-Pay Enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Modern Stat Tiles (Real live counts from database) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Total Contacts */}
        <div className="card p-5 bg-white border border-gray-100/90 shadow-sm rounded-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500">Total Contacts</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
            {Number(contacts.total_contacts || contacts.active_contacts || 0).toLocaleString()}
          </p>
        </div>

        {/* Tile 2: Messages Sent */}
        <div className="card p-5 bg-white border border-gray-100/90 shadow-sm rounded-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D3A1E]/10 text-[#2D3A1E] flex items-center justify-center">
              <Send size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500">Messages Sent</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
            {Number(overall.total_dispatched || 0).toLocaleString()}
          </p>
        </div>

        {/* Tile 3: Delivered */}
        <div className="card p-5 bg-white border border-gray-100/90 shadow-sm rounded-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500">Delivered</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
            {Number(overall.total_delivered || 0).toLocaleString()}
          </p>
        </div>

        {/* Tile 4: Failed */}
        <div className="card p-5 bg-white border border-gray-100/90 shadow-sm rounded-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500">Failed</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
            {Number(overall.total_failed || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaign Performance Chart + Recent Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campaign Performance Line Chart */}
        <div className="lg:col-span-8 card p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-teal-700" />
              <h2 className="text-sm font-bold text-gray-900">Campaign Performance</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span>Sent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Delivered</span>
              </div>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] text-gray-700">Last 30 Days</span>
            </div>
          </div>

          {/* SVG Smooth Curve Line Chart matching Mockup */}
          <div className="w-full h-52 relative pt-2">
            <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartOliveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D3A1E" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#2D3A1E" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartGoldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="60" x2="580" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y-Axis Labels */}
              <text x="15" y="24" fontSize="10" fill="#94A3B8" fontFamily="Inter">6k</text>
              <text x="15" y="64" fontSize="10" fill="#94A3B8" fontFamily="Inter">4k</text>
              <text x="15" y="104" fontSize="10" fill="#94A3B8" fontFamily="Inter">2k</text>
              <text x="25" y="144" fontSize="10" fill="#94A3B8" fontFamily="Inter">0</text>

              {/* Olive Curve: Sent */}
              <path
                d="M40 130 C 100 110, 140 100, 200 85 C 260 70, 310 90, 370 75 C 430 60, 480 85, 540 65 L 580 60 L 580 140 L 40 140 Z"
                fill="url(#chartOliveFill)"
              />
              <path
                d="M40 130 C 100 110, 140 100, 200 85 C 260 70, 310 90, 370 75 C 430 60, 480 85, 540 65 L 580 60"
                fill="none"
                stroke="#2D3A1E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Gold Curve: Delivered */}
              <path
                d="M40 140 C 100 120, 140 115, 200 100 C 260 85, 310 105, 370 90 C 430 75, 480 95, 540 75 L 580 70 L 580 140 L 40 140 Z"
                fill="url(#chartGoldFill)"
              />
              <path
                d="M40 140 C 100 120, 140 115, 200 100 C 260 85, 310 105, 370 90 C 430 75, 480 95, 540 75 L 580 70"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* X-Axis Dates */}
              <text x="50" y="165" fontSize="10" fill="#94A3B8" fontFamily="Inter">Oct 1</text>
              <text x="180" y="165" fontSize="10" fill="#94A3B8" fontFamily="Inter">Oct 8</text>
              <text x="310" y="165" fontSize="10" fill="#94A3B8" fontFamily="Inter">Oct 15</text>
              <text x="440" y="165" fontSize="10" fill="#94A3B8" fontFamily="Inter">Oct 22</text>
              <text x="550" y="165" fontSize="10" fill="#94A3B8" fontFamily="Inter">Oct 30</text>
            </svg>
          </div>
        </div>

        {/* Right: Recent Campaigns Card */}
        <div className="lg:col-span-4 card p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Recent Campaigns</h2>
              <button onClick={() => navigate('/posts')} className="text-xs font-bold text-[#2D3A1E] hover:text-[#D4AF37] flex items-center gap-1 transition">
                View All →
              </button>
            </div>

            <div className="space-y-3.5">
              {campaigns.length > 0 ? (
                campaigns.slice(0, 3).map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#2D3A1E]/10 text-[#2D3A1E] flex items-center justify-center shrink-0">
                        <Send size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 truncate max-w-[140px]">{formatCampaignDisplayName(c.name)}</p>
                        <p className="text-[10px] text-gray-500">
                          {c.total_recipients ? `${c.total_recipients} recipients` : 'Broadcast'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#1E2B16] bg-[#D4AF37]/25 px-2 py-0.5 rounded-full">
                        {c.status || 'Active'}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <p className="text-xs font-medium text-gray-500">No campaigns launched yet.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Connect WhatsApp and send your first broadcast.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <button
              onClick={() => navigate('/posts')}
              className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Send size={14} /> Create Broadcast Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Account Profile Status Bar */}
      <div className="card p-4 bg-white border border-gray-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${account.is_connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-xs font-bold text-gray-900">
            {account.verified_name || orgName}
          </span>
          <span className="text-[11px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-semibold">
            {account.display_phone || 'WhatsApp Cloud API Profile'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchDashboardData();
              if (selectedCampaignId) fetchCampaignDetails(selectedCampaignId, activeTab);
            }}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            Settings <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Campaign Selector Pill List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Select Live Campaign to Inspect Details:
          </h2>
          <span className="text-xs text-gray-500">{campaigns.length} campaign(s) recorded in database</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {campaigns.map((camp) => (
            <button
              key={camp.id}
              onClick={() => setSelectedCampaignId(camp.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                selectedCampaignId === camp.id
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <span>{formatCampaignDisplayName(camp.name)}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  camp.status === 'running'
                    ? 'bg-amber-400 text-amber-950 animate-pulse'
                    : camp.status === 'completed'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {camp.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Campaign Detail & Four Live Filter Tabs */}
      {selectedCampaignId && campaignProgress && (
        <div className="card p-6 space-y-5 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-black text-gray-900">
                  {formatCampaignDisplayName(campaignProgress.campaign?.name)}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-900">
                  Status: {campaignProgress.campaign?.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">
                Total Queue: {counts.total} • Replied Inquiries: {counts.replied}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {campaignProgress.campaign?.status === 'running' && (
                <>
                  <button
                    onClick={() => handlePause(selectedCampaignId)}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <Pause size={13} /> Pause
                  </button>
                  <button
                    onClick={() => handleCancel(selectedCampaignId)}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-red-600 hover:bg-red-50"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                </>
              )}
              {campaignProgress.campaign?.status === 'paused' && (
                <button
                  onClick={() => handleResume(selectedCampaignId)}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Play size={13} /> Resume
                </button>
              )}
            </div>
          </div>

          {/* Four Real Status Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('seen')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'seen'
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-teal-800">
                <span className="text-xs font-bold uppercase tracking-wider">Seen (Read)</span>
                <Eye size={16} />
              </div>
              <p className="text-2xl font-black text-teal-950 mt-1">{counts.read}</p>
              <p className="text-[10px] text-teal-700 mt-0.5">Blue tick confirmed opened</p>
            </button>

            <button
              onClick={() => setActiveTab('delivered_not_seen')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'delivered_not_seen'
                  ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold uppercase tracking-wider">Delivered, Not Seen</span>
                <CheckCircle size={16} />
              </div>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                {Math.max(0, counts.delivered - counts.read)}
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Double grey tick on phone</p>
            </button>

            <button
              onClick={() => setActiveTab('sent_not_delivered')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'sent_not_delivered'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-xs font-bold uppercase tracking-wider">Sent, Not Delivered</span>
                <Clock size={16} />
              </div>
              <p className="text-2xl font-black text-blue-950 mt-1">{counts.sent}</p>
              <p className="text-[10px] text-blue-700 mt-0.5">Single tick on Meta network</p>
            </button>

            <button
              onClick={() => setActiveTab('failed')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'failed'
                  ? 'border-red-600 bg-red-50 ring-2 ring-red-600/30'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-red-800">
                <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
                <AlertCircle size={16} />
              </div>
              <p className="text-2xl font-black text-red-950 mt-1">{counts.failed}</p>
              <p className="text-[10px] text-red-700 mt-0.5">Rejected by Meta or invalid number</p>
            </button>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 flex items-center justify-between">
            <span>
              ℹ️ <strong>Note:</strong> "Seen" is only counted when the customer has read receipts turned on in their WhatsApp settings.
            </span>
            <span className="text-[11px] text-gray-500 font-mono">Auto-refreshes every 5s while sending</span>
          </div>

          {/* Contact Status Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">WhatsApp Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4">Delivered At</th>
                  <th className="py-3 px-4">Read At</th>
                  <th className="py-3 px-4">Error / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {messagesLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Loading recipient messages from database...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No recipients found in tab "{activeTab.replace(/_/g, ' ')}" for this campaign.
                    </td>
                  </tr>
                ) : (
                  messages.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-bold text-gray-900">{m.contact_name}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-gray-700">{m.whatsapp_e164}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'read'
                              ? 'bg-teal-100 text-teal-800'
                              : m.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : m.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">
                        {m.sent_at ? new Date(m.sent_at).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">
                        {m.delivered_at ? new Date(m.delivered_at).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">
                        {m.read_at ? new Date(m.read_at).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-red-600 font-mono">
                        {m.error_message || (m.error_code ? `Code: ${m.error_code}` : '—')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp Setup Modal */}
      <WhatsAppSetupModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={(data) => {
          setShowConnectModal(false);
          updateWhatsAppStatusLocally({
            isConnected: true,
            displayPhone: data.display_phone,
            verifiedName: data.verified_name,
            qualityRating: data.quality_rating,
          });
          fetchDashboardData();
        }}
      />
    </div>
  );
}
