import React, { useState, useEffect, useMemo } from 'react';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../../api/notificationApi';
import { Bell, Check, CheckCircle2, Info, AlertTriangle, Circle } from 'lucide-react';
import Button from '../../../components/common/Button';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = useMemo(() => {
    if (filter === 'UNREAD') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NotificationIcon = ({ type }) => {
    switch(type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-slate-50 rounded-full"></span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
            <p className="text-sm text-slate-500 mt-1">You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
          >
            <Check size={16} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === 'UNREAD' ? 'bg-slate-800 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}
          >
            Unread Only
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading notifications...</div>
          ) : filteredNotifs.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Bell className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium text-slate-800">No notifications found.</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifs.map(notif => (
              <div 
                key={notif.id} 
                className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <NotificationIcon type={notif.type} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notif.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="flex-shrink-0 flex items-center">
                    <button 
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <Circle size={14} className="fill-indigo-600" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
