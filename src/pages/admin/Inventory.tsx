import React, { useEffect, useState } from 'react';
import { Boxes, Ticket, ShieldCheck, PieChart, Layers } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { adminApi } from '../../services/api/adminApi';
import { InventoryItem } from '../../types';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInventory();
      setItems(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalAll = items.reduce((acc, curr) => acc + curr.totalStock, 0);
  const totalAvailable = items.reduce((acc, curr) => acc + curr.availableStock, 0);
  const totalHeld = items.reduce((acc, curr) => acc + curr.heldStock, 0);
  const totalSold = items.reduce((acc, curr) => acc + curr.soldStock, 0);

  const isMathValid = totalAvailable + totalHeld + totalSold === totalAll;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Inventory Monitoring"
        subtitle="Real-time ticket stock auditing, reservation state splits & mathematical integrity"
        onRefresh={fetchInventory}
        isRefreshing={loading}
      />

      <div className="p-6 space-y-6">
        {/* Total Overall Integrity Summary Banner */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-semibold uppercase">
                SYSTEM STOCK EQUATION
              </span>
              <h2 className="text-lg font-bold text-white mt-1 font-mono">
                AVAILABLE + HELD + SOLD = TOTAL STOCK
              </h2>
              <p className="text-xs text-slate-400">
                Audited against Redis atomic operations and MongoDB persistence
              </p>
            </div>

            <div className={`px-4 py-2 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 ${
              isMathValid
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <ShieldCheck className="h-4 w-4" />
              <span>{isMathValid ? 'INVENTORY INTEGRITY: PERFECT MATCH' : 'INVENTORY DISCREPANCY DETECTED'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
              <p className="text-xs font-mono text-slate-400">TOTAL STOCK</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">{totalAll.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">Total Allocated</p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-lg border border-cyan-500/20">
              <p className="text-xs font-mono text-cyan-400">AVAILABLE</p>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{totalAvailable.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">{((totalAvailable / (totalAll || 1)) * 100).toFixed(1)}% of total</p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-lg border border-amber-500/20">
              <p className="text-xs font-mono text-amber-400">HELD IN CART</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{totalHeld.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">{((totalHeld / (totalAll || 1)) * 100).toFixed(1)}% of total</p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-lg border border-emerald-500/20">
              <p className="text-xs font-mono text-emerald-400">CONFIRMED SOLD</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{totalSold.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">{((totalSold / (totalAll || 1)) * 100).toFixed(1)}% of total</p>
            </div>
          </div>
        </div>

        {/* Per-Ticket-Type Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            INVENTORY BY TICKET TIER
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => {
              const itemValid = item.availableStock + item.heldStock + item.soldStock === item.totalStock;
              const availPct = (item.availableStock / item.totalStock) * 100;
              const heldPct = (item.heldStock / item.totalStock) * 100;
              const soldPct = (item.soldStock / item.totalStock) * 100;

              return (
                <div
                  key={item.productId}
                  className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-mono">{item.ticketType} TIER</h3>
                        <p className="text-xs text-slate-400">{item.eventName} • ₹{item.price}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700">
                      Total: {item.totalStock}
                    </span>
                  </div>

                  {/* Multi-Segment Stacked Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                      <span>Stock Allocation Visualization</span>
                      <span className="text-slate-300">{item.soldStock} Sold / {item.totalStock} Total</span>
                    </div>
                    <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        style={{ width: `${soldPct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-300"
                        title={`Sold: ${item.soldStock} (${soldPct.toFixed(1)}%)`}
                      ></div>
                      <div
                        style={{ width: `${heldPct}%` }}
                        className="bg-amber-500 h-full transition-all duration-300"
                        title={`Held: ${item.heldStock} (${heldPct.toFixed(1)}%)`}
                      ></div>
                      <div
                        style={{ width: `${availPct}%` }}
                        className="bg-cyan-500 h-full transition-all duration-300"
                        title={`Available: ${item.availableStock} (${availPct.toFixed(1)}%)`}
                      ></div>
                    </div>
                  </div>

                  {/* Numerical Grid */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-2">
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-cyan-500/20 text-center">
                      <p className="text-[10px] text-cyan-400 font-semibold">AVAILABLE</p>
                      <p className="text-lg font-bold text-white mt-0.5">{item.availableStock}</p>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-lg border border-amber-500/20 text-center">
                      <p className="text-[10px] text-amber-400 font-semibold">HELD</p>
                      <p className="text-lg font-bold text-white mt-0.5">{item.heldStock}</p>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-lg border border-emerald-500/20 text-center">
                      <p className="text-[10px] text-emerald-400 font-semibold">SOLD</p>
                      <p className="text-lg font-bold text-white mt-0.5">{item.soldStock}</p>
                    </div>
                  </div>

                  {/* Math Audit Check Footer */}
                  <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span>Validation ({item.availableStock} + {item.heldStock} + {item.soldStock}):</span>
                    <span className={`font-bold ${itemValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.availableStock + item.heldStock + item.soldStock} / {item.totalStock} {itemValid ? '✓ MATCH' : '✕ MISMATCH'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protection Note */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
          <p className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
            ⚠️ FRONTEND INVENTORY INTEGRITY POLICY:
          </p>
          <p>
            Direct frontend inventory modifications are strictly disabled. All stock decrements and holds execute atomically in Redis via Lua scripts on the backend API server.
          </p>
        </div>
      </div>
    </div>
  );
};
