import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Play, Pause, Square, Ticket, DollarSign, Boxes, Clock, CheckCircle2 } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminApi } from '../../services/api/adminApi';
import { Event, TicketType } from '../../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Event Form State
  const [name, setName] = useState('College Fest 2026');
  const [description, setDescription] = useState('Annual Mega Cultural & Musical Fest');
  const [date, setDate] = useState('2026-10-15T18:00');
  const [vipPrice, setVipPrice] = useState(500);
  const [vipStock, setVipStock] = useState(300);
  const [genPrice, setGenPrice] = useState(200);
  const [genStock, setGenStock] = useState(700);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = async (eventId: string, newStatus: Event['status']) => {
    try {
      await adminApi.updateEventStatus(eventId, newStatus);
      setEvents(prev =>
        prev.map(evt => (evt.eventId === eventId ? { ...evt, status: newStatus } : evt))
      );
      showToast(`Event status updated to ${newStatus} successfully.`);
    } catch (err) {
      showToast('Failed to update event status via backend API.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticketTypes: TicketType[] = [
      {
        typeId: `TKT-VIP-${Date.now()}`,
        name: 'VIP',
        price: Number(vipPrice),
        totalInventory: Number(vipStock),
        availableInventory: Number(vipStock),
        heldInventory: 0,
        soldInventory: 0
      },
      {
        typeId: `TKT-GEN-${Date.now()}`,
        name: 'GENERAL',
        price: Number(genPrice),
        totalInventory: Number(genStock),
        availableInventory: Number(genStock),
        heldInventory: 0,
        soldInventory: 0
      }
    ];

    try {
      const newEvt = await adminApi.createEvent({
        name,
        description,
        date: new Date(date).toISOString(),
        ticketTypes
      });

      setEvents(prev => [newEvt, ...prev]);
      setShowModal(false);
      showToast('New event created and registered in API server.');
    } catch (err) {
      showToast('Failed to create event via backend API.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Event Management"
        subtitle="Configure sale schedules, ticket tiers, pricing & status transitions"
        onRefresh={fetchEvents}
        isRefreshing={loading}
      />

      {toastMessage && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Action Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-mono">ALL MANAGED EVENTS</h2>
            <p className="text-xs text-slate-400">Total Events: {events.length}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.eventId}
              className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-semibold">
                      ID: {evt.eventId}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{evt.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{evt.description}</p>
                  </div>
                  <StatusBadge status={evt.status} />
                </div>

                <div className="mt-4 flex items-center space-x-4 text-xs font-mono text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(evt.date).toLocaleString()}</span>
                  </div>
                </div>

                {/* Ticket Tiers */}
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-mono text-slate-400 font-semibold uppercase">Ticket Tiers & Inventory</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evt.ticketTypes.map((tier) => (
                      <div
                        key={tier.typeId}
                        className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-cyan-300 flex items-center gap-1 font-mono">
                            <Ticket className="h-3.5 w-3.5" />
                            {tier.name}
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            ₹{tier.price}
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Total Stock:</span>
                            <span className="text-white font-semibold">{tier.totalInventory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className="text-cyan-400">{tier.availableInventory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Held:</span>
                            <span className="text-amber-400">{tier.heldInventory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sold:</span>
                            <span className="text-emerald-400">{tier.soldInventory}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleStatusChange(evt.eventId, 'ACTIVE')}
                  disabled={evt.status === 'ACTIVE'}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold font-mono disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>START SALE</span>
                </button>

                <button
                  onClick={() => handleStatusChange(evt.eventId, 'PAUSED')}
                  disabled={evt.status === 'PAUSED'}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold font-mono disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span>PAUSE SALE</span>
                </button>

                <button
                  onClick={() => handleStatusChange(evt.eventId, 'STOPPED')}
                  disabled={evt.status === 'STOPPED'}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold font-mono disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>STOP SALE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-lg p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-mono">Create New Ticketed Event</h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Event Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Event Date & Time</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              {/* VIP Tier Specs */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-cyan-400 font-mono">VIP Tier Configuration</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Price (₹)</label>
                    <input
                      type="number"
                      value={vipPrice}
                      onChange={(e) => setVipPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Total Inventory Stock</label>
                    <input
                      type="number"
                      value={vipStock}
                      onChange={(e) => setVipStock(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* GENERAL Tier Specs */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-cyan-400 font-mono">GENERAL Tier Configuration</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Price (₹)</label>
                    <input
                      type="number"
                      value={genPrice}
                      onChange={(e) => setGenPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono">Total Inventory Stock</label>
                    <input
                      type="number"
                      value={genStock}
                      onChange={(e) => setGenStock(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-lg shadow-cyan-600/30"
                >
                  Create & Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
