import React, { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ShieldAlert, AlertCircle } from 'lucide-react';

const WS_URL = 'ws://localhost:8000/ws/alerts';

const AlertToast = ({ t, alert }) => {
  const isCritical = alert.severity === 'Critical';
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full backdrop-blur-xl border rounded-xl p-4 pointer-events-auto flex gap-4 transition-all duration-300 ${
        isCritical
          ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 shadow-lg'
      }`}
    >
      <div className="flex-1 w-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isCritical
              ? <ShieldAlert className="text-red-500 animate-pulse" size={20} />
              : <AlertCircle className="text-orange-500" size={20} />
            }
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
              isCritical
                ? 'bg-red-500/20 text-red-500 border-red-500/40'
                : 'bg-orange-500/20 text-orange-500 border-orange-500/40'
            }`}>
              {alert.severity}
            </span>
          </div>
          <span className="text-slate-400 text-[10px] font-mono whitespace-nowrap ml-4">
            {alert.timestamp
              ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-white">{alert.message || alert.issue}</p>
        <p className="mt-1 text-xs text-slate-400 font-mono">
          <span className="text-slate-500">Resource:</span> {alert.resource}
        </p>
      </div>
      <div className="flex border-l border-slate-700/50 pl-4 items-center justify-center">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-2 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/**
 * LiveAlerts
 * - Connects to the backend WebSocket at /ws/alerts
 * - Shows a toast notification for every security alert received
 * - Calls onAlert(alert) so the parent can update the RiskTable
 */
const LiveAlerts = ({ onAlert }) => {
  const onAlertRef = useRef(onAlert);
  useEffect(() => { onAlertRef.current = onAlert; }, [onAlert]);

  useEffect(() => {
    let socket;
    let retryTimeout;

    const connect = () => {
      console.log(`[WS] Connecting to ${WS_URL}`);
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('[WS] Connected — listening for security alerts');
      };

      socket.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);
          console.log('[WS] Alert received:', alert);

          // Show toast for Critical and High
          if (alert.severity === 'Critical' || alert.severity === 'High') {
            toast.custom(
              (t) => <AlertToast t={t} alert={alert} />,
              { duration: 6000, position: 'top-right' }
            );
          }

          // Notify parent (e.g. to refresh RiskTable)
          if (onAlertRef.current) onAlertRef.current(alert);
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      socket.onerror = () => {
        console.warn('[WS] Connection error');
      };

      socket.onclose = () => {
        console.log('[WS] Disconnected — retrying in 5 s');
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (socket) socket.close();
    };
  }, []);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        top: 40,
        right: 40,
      }}
      toastOptions={{
        style: { background: 'transparent', boxShadow: 'none', padding: 0 },
      }}
    />
  );
};

export default LiveAlerts;
