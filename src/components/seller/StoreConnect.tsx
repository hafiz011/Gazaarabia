// components/seller/StoreConnect.tsx

'use client'

import { useState, useEffect } from 'react'
import type { StoreType } from '@/types/store'
import {
  Store,
  Link as LinkIcon,
  RefreshCw,
  Key,
  Globe,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Settings,
  ArrowRight,
  Database
} from 'lucide-react'

interface Props {
  sellerId: number
  token: string
}

interface FormState {
  domain?: string
  accessToken?: string
  siteUrl?: string
  consumerKey?: string
  consumerSecret?: string
}

interface SyncResult {
  imported?: number
  skipped?: number
  error?: string
}

export default function StoreConnect({ sellerId, token }: Props) {
  const [storeType, setStoreType] = useState<StoreType | ''>('')
  const [form, setForm] = useState<FormState>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [wooWebhookUrl, setWooWebhookUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [sellerId])

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/seller/store/status?sellerId=${sellerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setWooWebhookUrl(data.wooWebhookUrl ?? null)
      if (data.storeType) {
        setStoreType(data.storeType)
        setIsConnected(true)
        setLastSynced(data.lastSyncedAt)

        if (data.storeType === 'shopify') {
          setForm({
            domain: data.shopifyDomain,
            accessToken: data.shopifyAccessToken
          })
        } else {
          setForm({
            siteUrl: data.wooSiteUrl,
            consumerKey: data.wooConsumerKey,
            consumerSecret: data.wooConsumerSecret
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch store status:', err)
    } finally {
      setFetching(false)
    }
  }

  const updateForm = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handleConnect() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/seller/store/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sellerId, storeType, credentials: form }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Store configuration updated successfully!')
        setIsConnected(true)
        // Refresh status to get latest data if needed
      } else {
        setMessage(`${data.error}`)
      }
    } catch {
      setMessage('Connection failed. Please check your network.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setLoading(true)
    setMessage('⏳ Synchronizing products, please wait...')
    try {
      const res = await fetch('/api/seller/store/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sellerId }),
      })
      const data: SyncResult = await res.json()
      if (data.error) {
        setMessage(`${data.error}`)
      } else {
        setMessage(`Success! Imported: ${data.imported}, Skipped: ${data.skipped}`)
        setLastSynced(new Date().toISOString())
      }
    } catch {
      setMessage('Synchronization failed.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-xl">
        <RefreshCw size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Checking integration status...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden w-full max-w-2xl transition-all duration-300">
      {/* Premium Header */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Store size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">E-commerce Sync</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Integrate and automate your product catalog</span>
                {isConnected && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                    <CheckCircle2 size={10} /> Connected
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Database size={40} className="text-gray-100" />
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Step 1: Platform Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ShoppingBag size={18} className="text-blue-500" />
              1. Choose your platform
            </label>
            {storeType && (
              <button
                onClick={() => { setStoreType(''); setIsConnected(false); }}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Change Platform
              </button>
            )}
          </div>

          {!storeType ? (
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setStoreType('shopify')}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50"
              >
                <div className="p-4 rounded-2xl bg-gray-50 group-hover:bg-blue-600 group-hover:text-white text-gray-400 transition-all duration-300">
                  <Store size={32} />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900">Shopify</span>
                  <span className="text-xs text-gray-400 mt-1">Connect via Access Token</span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={16} className="text-blue-600" />
                </div>
              </button>

              <button
                onClick={() => setStoreType('woocommerce')}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50"
              >
                <div className="p-4 rounded-2xl bg-gray-50 group-hover:bg-purple-600 group-hover:text-white text-gray-400 transition-all duration-300">
                  <LinkIcon size={32} />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900">WooCommerce</span>
                  <span className="text-xs text-gray-400 mt-1">Connect via REST API</span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={16} className="text-purple-600" />
                </div>
              </button>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${storeType === 'shopify' ? 'border-blue-100 bg-blue-50/30' : 'border-purple-100 bg-purple-50/30'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${storeType === 'shopify' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
                  {storeType === 'shopify' ? <Store size={20} /> : <LinkIcon size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 capitalize">{storeType}</p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Active Selection</p>
                </div>
              </div>
              <CheckCircle2 size={24} className={storeType === 'shopify' ? 'text-blue-500' : 'text-purple-500'} />
            </div>
          )}
        </div>

        {/* Step 2: Configuration */}
        {storeType && (
          <div className="space-y-6 animate-fadeIn">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Settings size={18} className="text-blue-500" />
              2. Connection Settings
            </label>

            {storeType === 'shopify' && (
              <div className="grid gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Store Domain</label>
                  <div className="relative group">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium shadow-sm"
                      placeholder="example.myshopify.com"
                      value={form.domain || ''}
                      onChange={(e) => updateForm('domain', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Admin Access Token</label>
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium shadow-sm"
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                      type="password"
                      value={form.accessToken || ''}
                      onChange={(e) => updateForm('accessToken', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {storeType === 'woocommerce' && (
              <div className="grid gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Site URL</label>
                  <div className="relative group">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <input
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-purple-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium shadow-sm"
                      placeholder="https://yourstore.com"
                      value={form.siteUrl || ''}
                      onChange={(e) => updateForm('siteUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Consumer Key</label>
                    <div className="relative group">
                      <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                      <input
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-purple-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium shadow-sm"
                        placeholder="ck_xxxxx"
                        value={form.consumerKey || ''}
                        onChange={(e) => updateForm('consumerKey', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Consumer Secret</label>
                    <div className="relative group">
                      <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                      <input
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-purple-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium shadow-sm"
                        placeholder="cs_xxxxx"
                        type="password"
                        value={form.consumerSecret || ''}
                        onChange={(e) => updateForm('consumerSecret', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Webhook setup guide — enables automatic order-status sync */}
                {wooWebhookUrl && (
                  <div className="rounded-2xl border-2 border-purple-100 bg-purple-50/40 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-purple-600" />
                      <p className="text-sm font-bold text-gray-800">Order status sync (optional)</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      To sync order statuses back automatically, add a webhook in your store under{' '}
                      <span className="font-semibold text-gray-700">WooCommerce → Settings → Advanced → Webhooks</span>.
                      Use the delivery URL below, choose the <span className="font-semibold text-gray-700">Order updated</span> topic,
                      and set the webhook&apos;s <span className="font-semibold text-gray-700">Secret</span> to your{' '}
                      <span className="font-semibold text-gray-700">Consumer Secret</span> (the same value entered above).
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={wooWebhookUrl}
                        className="flex-1 bg-white border-2 border-purple-100 rounded-xl py-2.5 px-3 text-xs font-mono text-gray-700 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(wooWebhookUrl)}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition active:scale-95"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleConnect}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-2xl transition-all shadow-xl disabled:opacity-50 active:scale-95 ${storeType === 'shopify' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'}`}
              >
                {loading ? <RefreshCw size={20} className="animate-spin" /> : <LinkIcon size={20} />}
                {isConnected ? 'Update Connection' : 'Connect & Authorize'}
              </button>

              {isConnected && (
                <button
                  onClick={handleSync}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 active:scale-95"
                >
                  {loading ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                  Sync Products Now
                </button>
              )}
            </div>

            {lastSynced && (
              <p className="text-center text-xs text-gray-400 font-medium">
                Last synced: {new Date(lastSynced).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border-2 animate-fadeIn ${message.includes('❌') ? 'bg-red-50 text-red-700 border-red-100' :
            message.includes('⏳') ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
            <div className={`p-2 rounded-full ${message.includes('❌') ? 'bg-red-100' :
              message.includes('⏳') ? 'bg-blue-100 animate-pulse' :
                'bg-emerald-100'
              }`}>
              {message.includes('❌') ? <AlertCircle size={18} /> : message.includes('⏳') ? <RefreshCw size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <span className="flex-1">{message}</span>
            <button onClick={() => setMessage('')} className="text-2xl hover:scale-110 transition-transform opacity-30">&times;</button>
          </div>
        )}

        {!storeType && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-gray-200" />
            </div>
            <div>
              <p className="text-gray-900 font-bold">No Platform Selected</p>
              <p className="text-sm text-gray-400 mt-1 max-w-[280px]">Choose Shopify or WooCommerce above to begin your inventory synchronization</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="px-8 py-5 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-gray-400" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
        <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
          Gazaarabia Sync v2.4
        </div>
      </div>
    </div>
  )
}
