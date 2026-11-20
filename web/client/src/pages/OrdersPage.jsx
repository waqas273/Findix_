import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const OrdersPage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const pipelineStages = [
    { key: 'Pending', label: 'Order Placed', icon: Clock, desc: 'Cryptographic slug initialized' },
    { key: 'Processing', label: 'Laser Etching', icon: Sparkles, desc: 'Hardware fabrication & QC' },
    { key: 'Shipped', label: 'In Transit', icon: Truck, desc: 'Dispatched via express courier' },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Activated & ready to attach' },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const ords = Array.isArray(json.data) ? json.data : (json.data?.orders || []);
        setOrders(ords);
        if (ords.length > 0) {
          setSelectedOrderId(ords[0]._id);
        }
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const getStageIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const selectedOrder = orders.find((o) => o._id === selectedOrderId) || orders[0];

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-mono font-semibold border border-teal-200 mb-2 shadow-sm">
            <Truck className="w-3.5 h-3.5" /> HARDWARE FABRICATION & LOGISTICS
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Monitor real-time laser engraving, cryptographic verification, and courier dispatch across Pakistan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/store">
            <Button variant="primary" size="md" className="font-bold shadow-sm">
              <ShoppingBag className="w-4 h-4" />
              <span>Order New Hardware</span>
            </Button>
          </Link>
          <Button variant="outline" size="md" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. ORDERS CONTAINER */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 px-4 space-y-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto shadow-sm">
            <Package className="w-8 h-8 text-teal-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Hardware Orders Placed</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't ordered any physical recovery keychains or decals yet. Browse our hardware store with free nationwide shipping.
            </p>
          </div>
          <Link to="/store" className="inline-block pt-2">
            <Button variant="primary" size="md">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Hardware Tags</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Order Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider px-1">
              Your Orders ({orders.length})
            </div>
            
            <div className="space-y-3">
              {orders.map((order) => {
                const isSelected = order._id === selectedOrder?._id;
                const currentStageIdx = getStageIndex(order.pipelineStatus || 'Pending');
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <Badge
                        variant={
                          order.pipelineStatus === 'Delivered'
                            ? 'emerald'
                            : order.pipelineStatus === 'Shipped'
                            ? 'cyan'
                            : 'teal'
                        }
                        size="xs"
                      >
                        {order.pipelineStatus || 'Pending'}
                      </Badge>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        {order.items?.length || 1} Item(s)
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        PKR {order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Order Detailed Tracker */}
          {selectedOrder && (
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 sm:p-8 bg-white border-slate-200 space-y-6 shadow-sm">
                
                {/* Header: Order ID & Tracking Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[11px] font-mono text-teal-600 block uppercase font-bold">
                      Order Tracking Details
                    </span>
                    <h3 className="text-lg sm:text-xl font-display font-extrabold text-slate-900">
                      #{selectedOrder._id.toUpperCase()}
                    </h3>
                  </div>

                  <Badge
                    variant={
                      selectedOrder.pipelineStatus === 'Delivered'
                        ? 'emerald'
                        : selectedOrder.pipelineStatus === 'Shipped'
                        ? 'cyan'
                        : 'teal'
                    }
                    size="sm"
                  >
                    {selectedOrder.pipelineStatus || 'Pending'}
                  </Badge>
                </div>

                {/* Visual Tracking Pipeline Matrix */}
                <div className="space-y-4">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
                    Live Fulfillment Pipeline
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {pipelineStages.map((stage, idx) => {
                      const StageIcon = stage.icon;
                      const activeIdx = getStageIndex(selectedOrder.pipelineStatus || 'Pending');
                      const isPast = idx < activeIdx;
                      const isCurrent = idx === activeIdx;

                      return (
                        <div
                          key={stage.key}
                          className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                            isCurrent
                              ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm font-bold'
                              : isPast
                              ? 'bg-emerald-50/60 border-emerald-300 text-slate-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <StageIcon
                              className={`w-4 h-4 ${
                                isCurrent
                                  ? 'text-teal-600 animate-pulse'
                                  : isPast
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            />
                            {isPast && <Check className="w-3 h-3 text-emerald-600" />}
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-900">{stage.label}</div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                              {stage.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
                    Purchased Hardware Items
                  </div>

                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Tag className="w-4 h-4 text-teal-600" />
                            )}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{item.title || 'Smart Recovery Tag'}</h5>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Qty: {item.quantity || 1} &bull; PKR {(item.price || 0).toLocaleString()} each
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs text-slate-900">
                          PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address & Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-mono text-[10px] text-slate-500 uppercase block font-bold">
                      Delivery Address
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {selectedOrder.shippingAddress?.street || 'N/A'}<br />
                      {selectedOrder.shippingAddress?.city || 'Pakistan'}
                    </p>
                    <span className="text-slate-500 font-mono block">
                      Phone: {selectedOrder.shippingAddress?.phone || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-slate-500 uppercase block font-bold">
                      Payment & Courier
                    </span>
                    <div className="text-slate-700 space-y-0.5">
                      <div>Method: <b className="text-slate-900">Cash on Delivery (COD)</b></div>
                      <div>Courier: <b className="text-cyan-700">TCS / Leopards Express</b></div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-teal-700 font-mono">PKR {selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </Card>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
