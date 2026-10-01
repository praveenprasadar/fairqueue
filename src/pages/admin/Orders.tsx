import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Filter, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Key, CreditCard } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminApi } from '../../services/api/adminApi';
import { Order, OrderStatus } from '../../types';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'createdAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const itemsPerPage = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter & Search logic
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.holdId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.userName && ord.userName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || ord.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else {
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Order Management & Transactions"
        subtitle="Idempotent checkout records, payment status verification & audit logs"
        onRefresh={fetchOrders}
        isRefreshing={loading}
      />

      <div className="p-6 space-y-6">
        {/* Top Controls: Search, Filter, Sort */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Order ID, User ID, Hold ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-mono text-xs">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
                <option value="HELD">HELD</option>
                <option value="FAILED">FAILED</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <button
              onClick={() => {
                setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort: {sortField.toUpperCase()} ({sortOrder.toUpperCase()})</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              MASTER ORDERS REGISTRY
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Showing {paginatedOrders.length} of {sortedOrders.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Hold ID</th>
                  <th className="p-3">Ticket Type</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Order Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {paginatedOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-cyan-400">{ord.orderId}</td>
                    <td className="p-3 text-slate-300">{ord.userId}</td>
                    <td className="p-3 text-slate-400">{ord.holdId}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px]">
                        {ord.ticketType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{ord.quantity}</td>
                    <td className="p-3 font-bold text-emerald-400">₹{ord.amount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.paymentStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={ord.orderStatus} size="sm" />
                    </td>
                    <td className="p-3 text-slate-400">{new Date(ord.createdAt).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 inline" /> Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-30 cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-lg p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-cyan-400" />
                Order Record Details
              </h3>
              <StatusBadge status={selectedOrder.orderStatus} />
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="text-slate-400 text-[10px]">ORDER IDENTIFIERS</p>
                <p>Order ID: <span className="text-cyan-400 font-bold">{selectedOrder.orderId}</span></p>
                <p>User ID: <span className="text-white">{selectedOrder.userId} ({selectedOrder.userName || 'N/A'})</span></p>
                <p>Hold ID: <span className="text-amber-400">{selectedOrder.holdId}</span></p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="text-slate-400 text-[10px]">TICKET & PAYMENT</p>
                <p>Event: <span className="text-white font-sans font-semibold">{selectedOrder.eventName}</span></p>
                <p>Ticket Type: <span className="text-cyan-300">{selectedOrder.ticketType}</span></p>
                <p>Quantity: <span className="text-white font-bold">{selectedOrder.quantity}</span></p>
                <p>Total Amount: <span className="text-emerald-400 font-bold">₹{selectedOrder.amount}</span></p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-1">
                <p className="text-cyan-400 text-[10px] font-bold flex items-center gap-1">
                  <Key className="h-3 w-3" /> IDEMPOTENCY KEY
                </p>
                <p className="text-white font-mono break-all font-bold">{selectedOrder.idempotencyKey}</p>
                <p className="text-[10px] text-slate-500">Guarantees zero duplicate charge on retry</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
