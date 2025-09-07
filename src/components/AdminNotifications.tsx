import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type AdminNotification = {
  id: string; // Unique ID (e.g., order ID or generated)
  customerName: string;
  productName: string;
  quantity: number;
  timestamp: string | number | Date; // ISO string, ms, or Date
  read?: boolean;
};

export type AdminNotificationsProps = {
  // Optional external data source (new items can be passed here); component merges and persists them.
  items?: AdminNotification[];
  // Optional: key for localStorage persistence
  storageKey?: string;
  // Cap total stored items
  maxItems?: number;
  // Title and empty state customizations
  title?: string;
  emptyText?: string;
  // Emits whenever notifications state changes (after merging / toggle)
  onChange?: (notifications: AdminNotification[]) => void;
};

const DEFAULT_STORAGE_KEY = 'admin_notifications';

// Helpers
const toDate = (d: string | number | Date) => (d instanceof Date ? d : new Date(d));
const fmtDateTime = (d: string | number | Date) =>
  new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(toDate(d));
const initials = (name: string) => (name || '')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(s => s[0]?.toUpperCase())
  .join('') || 'NA';

function loadStored(key: string): AdminNotification[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as AdminNotification[];
    // sanitize
    return Array.isArray(arr) ? arr.filter(n => !!n && typeof n.id === 'string') : [];
  } catch {
    return [];
  }
}

function saveStored(key: string, data: AdminNotification[]) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function mergeById(existing: AdminNotification[], incoming: AdminNotification[], maxItems: number): AdminNotification[] {
  if (!incoming?.length) return existing.slice(0, maxItems);
  const map = new Map<string, AdminNotification>();
  // Start with existing to keep read state
  for (const n of existing) map.set(n.id, { ...n });
  for (const n of incoming) {
    const prev = map.get(n.id);
    if (prev) {
      // Keep read state from prev, update other fields from incoming
      map.set(n.id, { ...prev, ...n, read: prev.read });
    } else {
      map.set(n.id, { ...n, read: n.read ?? false });
    }
  }
  const merged = Array.from(map.values())
    .sort((a, b) => +toDate(b.timestamp) - +toDate(a.timestamp))
    .slice(0, maxItems);
  return merged;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  items,
  storageKey = DEFAULT_STORAGE_KEY,
  maxItems = 200,
  title = 'Notifications de commandes',
  emptyText = 'Aucune notification',
  onChange,
}) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Load from storage on mount
  useEffect(() => {
    const stored = loadStored(storageKey);
    setNotifications(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Merge external items when they change
  useEffect(() => {
    if (!items) return;
    setNotifications(prev => {
      const next = mergeById(prev, items, maxItems);
      saveStored(storageKey, next);
      onChange?.(next);
      return next;
    });
  }, [items, storageKey, maxItems, onChange]);

  // Derived
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const filtered = useMemo(() => filter === 'unread' ? notifications.filter(n => !n.read) : notifications, [notifications, filter]);

  // Actions
  const toggleRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: !n.read } : n);
      saveStored(storageKey, next);
      onChange?.(next);
      return next;
    });
  }, [storageKey, onChange]);

  const markAll = useCallback((read: boolean) => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read }));
      saveStored(storageKey, next);
      onChange?.(next);
      return next;
    });
  }, [storageKey, onChange]);

  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 md:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
            <p className="text-white/80 text-sm">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 rounded-xl p-1 flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-white text-indigo-700' : 'text-white/90 hover:bg-white/20'}`}
            >Toutes</button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'unread' ? 'bg-white text-indigo-700' : 'text-white/90 hover:bg-white/20'}`}
            >Non lues</button>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => markAll(true)}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold border border-white/20"
            >Tout marquer comme lu</button>
            <button
              onClick={() => markAll(false)}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold border border-white/20"
            >Tout marquer comme non lu</button>
          </div>
        </div>
      </div>

      {/* Actions (mobile) */}
      <div className="sm:hidden px-4 py-3 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => markAll(true)}
          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold border border-gray-200 dark:border-gray-700"
        >Tout lu</button>
        <button
          onClick={() => markAll(false)}
          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold border border-gray-200 dark:border-gray-700"
        >Tout non lu</button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800" role="list" aria-live="polite">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">{emptyText}</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 md:p-5 flex items-start gap-4 transition-colors ${n.read ? 'bg-white dark:bg-gray-900' : 'bg-indigo-50/60 dark:bg-indigo-900/10'}`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow ${n.read ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200' : 'bg-indigo-600 text-white'}`}>
                  {initials(n.customerName)}
                </div>
                {!n.read && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-3">
                  <h3 className={`text-base md:text-lg font-semibold truncate ${n.read ? 'text-gray-800 dark:text-gray-200' : 'text-indigo-800 dark:text-indigo-300'}`}>
                    Nouvelle commande de <span className="underline decoration-indigo-300/60 underline-offset-4">{n.customerName}</span>
                  </h3>
                  <time className="text-xs md:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {fmtDateTime(n.timestamp)}
                  </time>
                </div>
                <p className="mt-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
                  Produit: <span className="font-medium">{n.productName}</span>
                  <span className="mx-2 opacity-50">•</span>
                  Quantité: <span className="font-medium">{n.quantity}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRead(n.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${n.read
                    ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'}`}
                  aria-pressed={n.read}
                >
                  {n.read ? 'Marquer non lu' : 'Marquer comme lu'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

// Helper to push a new notification directly to localStorage (useful from global event handlers)
export function pushAdminNotification(item: AdminNotification, storageKey: string = DEFAULT_STORAGE_KEY, maxItems: number = 200) {
  const existing = loadStored(storageKey);
  const merged = mergeById(existing, [item], maxItems);
  saveStored(storageKey, merged);
}

export default AdminNotifications;
