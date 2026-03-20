import React, { useState, useEffect, useRef } from 'react';
import { Bell, Info, ShieldAlert, CheckCircle, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import { riskService } from '../../services/api';
import { toast } from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5001';


const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Initial Load
    loadNotifications();

    // 2. Request Browser Notification Permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 3. Socket.io Integration
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('new_notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Real Browser Notification
      if (Notification.permission === 'granted') {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/favicon.ico'
        });
      }

      // Sound logic for critical
      if (newNotif.severity === 'critical') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Sound blocked by browser'));
        toast.error(`CRITICAL: ${newNotif.title}`, { duration: 6000 });
      } else {
        toast.success(`NEW ALERT: ${newNotif.title}`);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await riskService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await riskService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to update notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await riskService.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast('Notifications cleared', { icon: '🗑️' });
    } catch (err) {
      console.error('Failed to clear notifications');
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group active:scale-95"
      >
        <Bell className="w-5 h-5 text-[#94a3b8] group-hover:text-[#00E5FF] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-[#FF4D4F] rounded-full border-2 border-[#0b0f19] shadow-[0_0_10px_rgba(255,77,79,0.5)] animate-pulse flex items-center justify-center text-[7px] text-white font-black">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-[400px] bg-[#0d111c] border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Security Feed <span className="bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount} UNREAD</span>
            </h3>
            <button 
              onClick={handleClearAll}
              className="text-[10px] text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5 uppercase font-black"
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-gray-600 mx-auto opacity-30" />
                <p className="text-xs text-gray-500">Security posture is solid. No new alerts detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-4 hover:bg-white/[0.02] transition-all cursor-pointer relative group ${notif.read ? 'opacity-60' : 'bg-white/[0.01]'}`}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  >
                    {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E5FF]"></div>}
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-lg border h-fit ${getSeverityStyle(notif.severity)}`}>
                        {notif.severity === 'critical' ? <ShieldAlert size={14} /> : notif.severity === 'high' ? <AlertTriangle size={14} /> : <Info size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold truncate ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                          <span className="text-[9px] text-gray-600 whitespace-nowrap uppercase font-bold tracking-widest">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
            <button className="text-[10px] text-[#00E5FF] font-black uppercase tracking-widest hover:underline transition-all">
              View all compliance history
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
