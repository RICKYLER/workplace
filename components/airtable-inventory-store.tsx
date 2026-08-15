"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Filter,
  EyeOff,
  Layers,
  ArrowUpDown,
  Palette,
  Table,
  CheckCircle2,
  FileText,
  DollarSign,
  Tag,
  MapPin,
  Info,
  X,
  MessageCircle,
  Grid,
  UserCheck,
  Building2,
  Music2,
  Zap,
  LayoutTemplate,
  FormInput,
  Check,
  Bell,
  Play,
  Send,
  PieChart,
  BarChart3,
  TrendingUp,
  Copy,
  UploadCloud,
  Clock,
  Camera
} from "lucide-react";

export interface InventoryItem {
  id: string;
  name: string;
  category: "Piano Inventory Goods" | "Personal Asset" | "Shop Asset";
  price: number;
  status: "Available" | "Reserved" | "Sold";
  description: string;
  location: string;
  notes: string;
  images: string[];
  createdTime: string;
}

type TableTab = "shop" | "personal" | "tools" | "all";
type HeaderTab = "data" | "automations" | "interfaces";

interface AirtableInventoryStoreProps {
  initialTab?: TableTab;
}

export default function AirtableInventoryStore({ initialTab = "shop" }: AirtableInventoryStoreProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Top Navigation Header Tab: 'data' | 'automations' | 'interfaces' | 'forms'
  const [activeHeaderTab, setActiveHeaderTab] = useState<HeaderTab>("data");

  // Active Table Tab: 'shop' (Shop Inventory) | 'personal' (Personal Inventory) | 'tools' (Shop Assets) | 'all'
  const [activeTableTab, setActiveTableTab] = useState<TableTab>(initialTab);

  // Active view mode: 'grid' | 'gallery'
  const [activeView, setActiveView] = useState<"grid" | "gallery">("grid");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modal / Drawer
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Submission feedback
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // 1. Instant local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewItem((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);

      // 2. Upload photo to server API
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setNewItem((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (err: any) {
      console.error("Failed to upload photo from device:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const [newItem, setNewItem] = useState({
    name: "Yamaha U1 Upright Piano",
    category: "Piano Inventory Goods" as "Piano Inventory Goods" | "Personal Asset" | "Shop Asset",
    price: "165000",
    status: "Available" as "Available" | "Reserved" | "Sold",
    description: "Refurbished acoustic upright piano imported from Japan",
    location: "Main Showroom",
    notes: "Inspected & tuned by Robert Herrero",
    imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1000&q=80"
  });

  // Automations Toggles state
  const [automations, setAutomations] = useState([
    {
      id: "auto-1",
      title: "When record status changes to 'Sold' → Auto-generate Receipt & Send Messenger Alert",
      trigger: "Record updated in Airtable",
      action: "Send Facebook Messenger & Email Notification",
      active: true,
      runs: 14
    },
    {
      id: "auto-2",
      title: "When new Personal Asset is added → Auto-update Bossing Valuation Summary",
      trigger: "New record created in Personal Inventory",
      action: "Recalculate Net Worth & Log Audit",
      active: true,
      runs: 8
    },
    {
      id: "auto-3",
      title: "6-Month Tuning Follow-up Reminder → Auto-schedule Customer Service Job",
      trigger: "Scheduled timer (every 6 months)",
      action: "Create Job Order & Send WhatsApp Reminder",
      active: true,
      runs: 42
    }
  ]);

  const [lastSynced, setLastSynced] = useState<string>("");
  const baseId = "appZXsrxksqmSnake";

  const fetchInventory = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const url = "/api/inventory" + (isManual ? `?fresh=true&t=${Date.now()}` : "");
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch Airtable records");
      }

      setItems(data.records || []);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err.message || "Airtable API connection failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTableTab(initialTab);
    }
  }, [initialTab]);

  // Sync default form values when activeTableTab changes
  useEffect(() => {
    if (activeTableTab === "personal") {
      setNewItem({
        name: "Steinway & Sons Vintage Concert Bench",
        category: "Personal Asset",
        price: "32000",
        status: "Available",
        description: "Heavily padded genuine leather adjustable concert bench",
        location: "Private Collection Room",
        notes: "Personal collection item owned by Bossing",
        imageUrl: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=1000&q=80"
      });
    } else if (activeTableTab === "shop") {
      setNewItem({
        name: "Yamaha U1 Upright Piano",
        category: "Piano Inventory Goods",
        price: "165000",
        status: "Available",
        description: "Refurbished acoustic upright piano imported from Japan",
        location: "Main Showroom",
        notes: "Inspected & tuned by Robert Herrero",
        imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1000&q=80"
      });
    } else if (activeTableTab === "tools") {
      setNewItem({
        name: "Master Piano Tuning Hammer Kit",
        category: "Shop Asset",
        price: "18500",
        status: "Available",
        description: "Custom tuning hammer, felts, and mute levers",
        location: "Workshop Tool Cabinet",
        notes: "Technical shop equipment",
        imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80"
      });
    }
  }, [activeTableTab]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      let matchesTab = true;
      if (activeTableTab === "shop") {
        matchesTab = item.category === "Piano Inventory Goods";
      } else if (activeTableTab === "personal") {
        matchesTab = item.category === "Personal Asset";
      } else if (activeTableTab === "tools") {
        matchesTab = item.category === "Shop Asset";
      }

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [items, activeTableTab, searchQuery, selectedStatus]);

  const tabCounts = useMemo(() => {
    const shop = items.filter((i) => i.category === "Piano Inventory Goods").length;
    const personal = items.filter((i) => i.category === "Personal Asset").length;
    const tools = items.filter((i) => i.category === "Shop Asset").length;
    const all = items.length;

    const personalValuation = items
      .filter((i) => i.category === "Personal Asset")
      .reduce((sum, i) => sum + (i.price || 0), 0);

    const shopValuation = items
      .filter((i) => i.category === "Piano Inventory Goods")
      .reduce((sum, i) => sum + (i.price || 0), 0);

    const totalValuation = items.reduce((sum, i) => sum + (i.price || 0), 0);

    return { shop, personal, tools, all, personalValuation, shopValuation, totalValuation };
  }, [items]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = newItem.name.trim() || (activeTableTab === "personal" ? "Steinway Vintage Concert Bench" : "Yamaha U1 Piano");
    const payload = {
      ...newItem,
      name: finalName,
      price: newItem.price || "35000",
      description: newItem.description || "Item recorded in RHPS Airtable Inventory",
      location: newItem.location || (activeTableTab === "personal" ? "Private Collection Room" : "Main Showroom"),
      notes: newItem.notes || "Managed via RHPS Airtable OS"
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to add record to Airtable");
      }

      alert(`✅ Success! Item "${finalName}" has been saved to your live Airtable Base.`);
      setIsAddModalOpen(false);
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 4000);
      
      // Fetch fresh records bypassing cache
      await fetchInventory(true);
    } catch (err: any) {
      alert("⚠️ Error saving to Airtable: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Reserved":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Sold":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-gray-800 font-sans min-h-screen flex flex-col border border-gray-300 rounded-xl overflow-hidden shadow-xs">
      
      {/* 1. AIRTABLE TOP HEADER BAR (Data, Automations, Interfaces, Forms) */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition">
            <div className="w-6 h-6 rounded bg-[#20c997] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              A
            </div>
            <span className="font-bold text-sm text-gray-900">RHPS Operations Base</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </div>

          {/* Fully Interactive Top Header Tabs */}
          <nav className="flex items-center space-x-1 text-xs font-medium ml-2 sm:ml-4">
            <button
              onClick={() => setActiveHeaderTab("data")}
              className={`px-3 py-1.5 rounded transition flex items-center ${
                activeHeaderTab === "data"
                  ? "text-gray-900 font-bold border-b-2 border-[#20c997] bg-gray-50"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Table className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Data
            </button>

            <button
              onClick={() => setActiveHeaderTab("automations")}
              className={`px-3 py-1.5 rounded transition flex items-center ${
                activeHeaderTab === "automations"
                  ? "text-purple-900 font-bold border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Automations
            </button>

            <button
              onClick={() => setActiveHeaderTab("interfaces")}
              className={`px-3 py-1.5 rounded transition flex items-center ${
                activeHeaderTab === "interfaces"
                  ? "text-blue-900 font-bold border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Interfaces
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            Live Sync: {baseId} {lastSynced && `(${lastSynced})`}
          </span>

          <button
            onClick={() => fetchInventory(true)}
            disabled={refreshing}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
            title="Sync with Airtable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <a
            href={`https://airtable.com/${baseId}/tblvr3hoI1xbOde1c`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition text-xs flex items-center border border-gray-300"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1 text-gray-500" />
            Open in Airtable
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-[#20c997] hover:bg-[#12b886] text-white rounded font-bold transition text-xs flex items-center shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Record
          </button>
        </div>
      </header>

      {/* ========================================================================================= */}
      {/* TAB 1: DATA VIEW (SPREADSHEET GRID & TABLE TABS) */}
      {/* ========================================================================================= */}
      {activeHeaderTab === "data" && (
        <>
          {/* Sub-Header Green Bar (Table Selection Tabs) */}
          <div className="bg-[#e6fcf5] border-b border-[#b2f2bb] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setActiveTableTab("shop")}
                className={`px-3 py-1 rounded font-bold text-xs flex items-center transition shadow-2xs ${
                  activeTableTab === "shop"
                    ? "bg-white text-emerald-950 border border-[#b2f2bb]"
                    : "text-emerald-800 hover:bg-white/60"
                }`}
              >
                <Music2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>🏪 Shop Inventory (Sales)</span>
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono">
                  {tabCounts.shop}
                </span>
              </button>

              <button
                onClick={() => setActiveTableTab("personal")}
                className={`px-3 py-1 rounded font-bold text-xs flex items-center transition shadow-2xs ${
                  activeTableTab === "personal"
                    ? "bg-white text-purple-950 border border-purple-300 ring-1 ring-purple-400"
                    : "text-emerald-800 hover:bg-white/60"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                <span>👤 Personal Inventory (Owner/Private)</span>
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono">
                  {tabCounts.personal}
                </span>
              </button>

              <button
                onClick={() => setActiveTableTab("tools")}
                className={`px-3 py-1 rounded font-bold text-xs flex items-center transition shadow-2xs ${
                  activeTableTab === "tools"
                    ? "bg-white text-teal-950 border border-[#b2f2bb]"
                    : "text-emerald-800 hover:bg-white/60"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                <span>🛠️ Shop Equipment & Tools</span>
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono">
                  {tabCounts.tools}
                </span>
              </button>

              <button
                onClick={() => setActiveTableTab("all")}
                className={`px-3 py-1 rounded font-bold text-xs flex items-center transition ${
                  activeTableTab === "all"
                    ? "bg-white text-slate-900 border border-slate-300"
                    : "text-emerald-800 hover:bg-white/60"
                }`}
              >
                <span>🌐 All Units ({tabCounts.all})</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs text-emerald-900 font-medium">
              {activeTableTab === "personal" ? (
                <span className="bg-purple-100/80 px-2.5 py-0.5 rounded text-purple-900 font-bold border border-purple-200">
                  Personal Valuation: <strong>{formatCurrency(tabCounts.personalValuation)}</strong>
                </span>
              ) : (
                <span className="bg-emerald-100/80 px-2.5 py-0.5 rounded text-emerald-900 font-bold border border-emerald-200">
                  Shop Stock Valuation: <strong>{formatCurrency(tabCounts.shopValuation)}</strong>
                </span>
              )}
              <span>Showing <strong>{filteredItems.length}</strong> unit(s)</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 p-0.5 rounded border border-gray-200">
                <button
                  onClick={() => setActiveView("grid")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center transition ${
                    activeView === "grid" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Table className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Grid View
                </button>
                <button
                  onClick={() => setActiveView("gallery")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center transition ${
                    activeView === "gallery" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 mr-1 text-blue-600" /> Gallery View
                </button>
              </div>

              <div className="hidden sm:flex items-center space-x-3 text-gray-600">
                <button className="flex items-center hover:text-gray-900"><EyeOff className="w-3.5 h-3.5 mr-1" /> Hide fields</button>
                <button className="flex items-center hover:text-gray-900"><Filter className="w-3.5 h-3.5 mr-1" /> Filter</button>
                <button className="flex items-center hover:text-gray-900"><Layers className="w-3.5 h-3.5 mr-1" /> Group</button>
                <button className="flex items-center hover:text-gray-900"><ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Sort</button>
                <button className="flex items-center hover:text-gray-900"><Palette className="w-3.5 h-3.5 mr-1" /> Color</button>
              </div>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTableTab === "personal" ? "personal assets..." : "inventory..."}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Main Table Grid */}
          <div className="flex flex-1 overflow-hidden bg-[#f8fafc]">
            <aside className="w-48 bg-white border-r border-gray-200 p-3 hidden md:block select-none text-xs">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Table Views</div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTableTab("shop")}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between font-medium ${
                    activeTableTab === "shop" ? "bg-emerald-50 text-emerald-900 font-bold" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center"><Music2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Shop Inventory</span>
                </button>

                <button
                  onClick={() => setActiveTableTab("personal")}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between font-medium ${
                    activeTableTab === "personal" ? "bg-purple-50 text-purple-900 font-bold" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center"><UserCheck className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Personal Assets</span>
                </button>

                <button
                  onClick={() => setActiveTableTab("tools")}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between font-medium ${
                    activeTableTab === "tools" ? "bg-teal-50 text-teal-900 font-bold" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Shop Equipment</span>
                </button>
              </div>
            </aside>

            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <div className="bg-white border border-gray-200 rounded p-12 text-center my-4">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-600">Loading Airtable records...</p>
                </div>
              ) : activeView === "grid" ? (
                <div className="bg-white border border-gray-300 rounded overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-gray-300 text-gray-600 font-bold select-none text-[11px]">
                        <th className="py-2 px-3 w-10 text-center border-r border-gray-200">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="py-2 px-3 w-12 text-center border-r border-gray-200 font-mono text-gray-400">#</th>
                        <th className="py-2 px-4 min-w-[200px] border-r border-gray-200">
                          <div className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1 text-gray-400" /> Asset Name / Item</div>
                        </th>
                        <th className="py-2 px-4 min-w-[150px] border-r border-gray-200">
                          <div className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1 text-purple-500" /> Category</div>
                        </th>
                        <th className="py-2 px-4 min-w-[120px] border-r border-gray-200">
                          <div className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Valuation (₱)</div>
                        </th>
                        <th className="py-2 px-4 min-w-[120px] border-r border-gray-200">
                          <div className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600" /> Status</div>
                        </th>
                        <th className="py-2 px-4 min-w-[160px] border-r border-gray-200">
                          <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" /> Storage Location</div>
                        </th>
                        <th className="py-2 px-4 min-w-[240px]">
                          <div className="flex items-center"><Info className="w-3.5 h-3.5 mr-1 text-gray-400" /> Technical & Ownership Notes</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                      {filteredItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          onClick={() => setActiveItem(item)}
                          className="hover:bg-purple-50/50 transition cursor-pointer group"
                        >
                          <td className="py-2 px-3 text-center border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="rounded border-gray-300" />
                          </td>
                          <td className="py-2 px-3 text-center text-gray-400 font-mono text-[11px] border-r border-gray-200">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-4 font-bold text-gray-900 border-r border-gray-200 group-hover:text-purple-700">
                            {item.name}
                          </td>
                          <td className="py-2 px-4 border-r border-gray-200">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              item.category === "Personal Asset" ? "bg-purple-100 text-purple-800 border-purple-300 font-bold" : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {item.category === "Personal Asset" ? "👤 Personal Asset" : item.category}
                            </span>
                          </td>
                          <td className="py-2 px-4 font-extrabold text-emerald-700 border-r border-gray-200">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-2 px-4 border-r border-gray-200">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadgeStyle(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-gray-600 border-r border-gray-200">
                            {item.location}
                          </td>
                          <td className="py-2 px-4 text-gray-500 truncate max-w-xs font-mono text-[11px]">
                            {item.notes || item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-2.5 bg-gray-50 border-t border-gray-300 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="font-bold text-purple-700 hover:text-purple-800 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add new {activeTableTab === "personal" ? "Personal Asset" : "record"} to Airtable
                    </button>
                    <span className="text-gray-500 font-mono text-[11px]">{filteredItems.length} records</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer p-4 space-y-3"
                    >
                      <div className="aspect-[16/10] bg-gray-100 rounded overflow-hidden">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                          {item.category === "Personal Asset" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-bold">
                              Personal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-extrabold text-emerald-700">{formatCurrency(item.price)}</span>
                          <span className={`px-2 py-0.5 text-[10px] rounded font-bold border ${getStatusBadgeStyle(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: AUTOMATIONS VIEW (AIRTABLE WORKFLOW STUDIO) */}
      {/* ========================================================================================= */}
      {activeHeaderTab === "automations" && (
        <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                Airtable Automations Studio
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Active automated workflows triggering Facebook Messenger, Email, SMS, and Financial valuation updates.
              </p>
            </div>
            <button className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Automation
            </button>
          </div>

          <div className="space-y-4">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="bg-white border border-gray-300 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                      Active Workflow
                    </span>
                    <span className="text-xs text-gray-400 font-mono">ID: {auto.id}</span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900">{auto.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center"><Play className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Trigger: {auto.trigger}</span>
                    <span className="flex items-center"><Send className="w-3.5 h-3.5 mr-1 text-blue-600" /> Action: {auto.action}</span>
                    <span className="flex items-center text-purple-700 font-bold"><Clock className="w-3.5 h-3.5 mr-1" /> Executed {auto.runs} times</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleAutomation(auto.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      auto.active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {auto.active ? "● ON" : "○ OFF"}
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold border border-gray-300">
                    Test Workflow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: INTERFACES VIEW (EXECUTIVE DASHBOARD) */}
      {/* ========================================================================================= */}
      {activeHeaderTab === "interfaces" && (
        <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <LayoutTemplate className="w-5 h-5 text-blue-600 mr-2" />
                Executive Interface Dashboard
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Real-time visual metrics, stock valuation, and asset allocation powered by Airtable Base.
              </p>
            </div>
            <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center">
              <Plus className="w-4 h-4 mr-1.5" />
              Customize Interface
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Combined Valuation</div>
              <div className="text-2xl font-extrabold text-gray-900">{formatCurrency(tabCounts.totalValuation)}</div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Includes Shop & Personal Assets
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Assets Valuation</div>
              <div className="text-2xl font-extrabold text-purple-700">{formatCurrency(tabCounts.personalValuation)}</div>
              <div className="text-xs text-purple-600 font-semibold">{tabCounts.personal} private units recorded</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop Inventory Valuation</div>
              <div className="text-2xl font-extrabold text-blue-700">{formatCurrency(tabCounts.shopValuation)}</div>
              <div className="text-xs text-blue-600 font-semibold">{tabCounts.shop} pianos for sale</div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-300 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                  {activeItem.category}
                </span>
                <h3 className="font-bold text-gray-900 text-sm">{activeItem.name}</h3>
              </div>
              <button onClick={() => setActiveItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="aspect-[16/9] rounded overflow-hidden bg-gray-100">
                <img src={activeItem.images[0]} alt={activeItem.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-extrabold text-emerald-700">{formatCurrency(activeItem.price)}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusBadgeStyle(activeItem.status)}`}>
                  {activeItem.status}
                </span>
              </div>

              <p className="bg-gray-50 p-3 rounded border border-gray-200">{activeItem.description}</p>

              {activeItem.notes && (
                <div className="bg-purple-50 p-3 rounded border border-purple-200 text-purple-900 font-mono">
                  <strong>Technical & Ownership Notes:</strong> {activeItem.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
              <button onClick={() => setActiveItem(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-xs">
                Close
              </button>
              <a
                href={`https://m.me/rhpianoservices?text=${encodeURIComponent(`Inquiring about ${activeItem.name} (${formatCurrency(activeItem.price)})`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-xs flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Inquire on FB Messenger
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-300 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <Plus className="w-4 h-4 text-purple-600 mr-1.5" />
                Add {activeTableTab === "personal" ? "Personal Asset" : "Record"} to Airtable
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1 font-semibold">Asset / Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder={activeTableTab === "personal" ? "Steinway Vintage Concert Bench" : "Yamaha U1 Piano"}
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none font-bold"
                  >
                    <option value="Personal Asset">👤 Personal Asset</option>
                    <option value="Piano Inventory Goods">🏪 Piano Inventory Goods</option>
                    <option value="Shop Asset">🛠️ Shop Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Valuation (₱)</label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Storage Location</label>
                  <input
                    type="text"
                    placeholder="Private Collection Room"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-semibold flex items-center justify-between">
                  <span className="flex items-center"><Camera className="w-3.5 h-3.5 mr-1 text-purple-600" /> Piano / Asset Photo</span>
                  <span className="text-[10px] text-purple-700 font-normal">Upload from Device</span>
                </label>

                <div className="space-y-2">
                  <label className="w-full cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg px-3 py-2.5 text-center text-xs font-bold transition flex items-center justify-center shadow-2xs">
                    <UploadCloud className="w-4 h-4 mr-2 text-purple-600" />
                    {isUploadingPhoto ? "Uploading photo from device..." : "📁 Upload Photo from Device / Gallery"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDeviceFileUpload}
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. https://...)"
                    value={newItem.imageUrl.startsWith("data:") ? "" : newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                {newItem.imageUrl && (
                  <div className="mt-2 aspect-[16/9] w-full max-h-28 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 shadow-2xs relative group">
                    <img
                      src={newItem.imageUrl}
                      alt="Photo Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1000&q=80";
                      }}
                    />
                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-bold backdrop-blur-xs">
                      Photo Ready
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-semibold">Technical & Ownership Notes</label>
                <textarea
                  rows={2}
                  placeholder="Personal collection item owned by Bossing..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Saving to Airtable..." : "Save to Airtable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
