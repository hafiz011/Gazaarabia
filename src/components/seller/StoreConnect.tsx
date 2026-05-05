// components/seller/StoreConnect.tsx

'use client'

import { useState } from 'react'
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
  ShoppingBag
} from 'lucide-react'

interface Props {
  sellerId: number
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

export default function StoreConnect({ sellerId }: Props) {
  const [storeType, setStoreType] = useState<StoreType | ''>('')
  const [form, setForm] = useState<FormState>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const updateForm = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  async function handleConnect() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/seller/store/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, storeType, credentials: form }),
      })
      const data = await res.json()
      setMessage(data.success ? '✅ Store Connected Successfully!' : `❌ ${data.error}`)
    } catch {
      setMessage('❌ Connection failed. Please check your network.')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      })
      const data: SyncResult = await res.json()
      setMessage(
        data.error
          ? `❌ ${data.error}`
          : `✅ Success! Imported: ${data.imported}, Skipped: ${data.skipped}`
      )
    } catch {
      setMessage('❌ Synchronization failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden w-full max-w-xl transition-all duration-300">
      {/* Header */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 border border-gray-100">
            <Store size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Connect Store</h2>
            <p className="text-sm text-gray-500 mt-0.5">Integrate your e-commerce platform</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Store Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ShoppingBag size={16} className="text-gray-400" />
            Select Platform
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setStoreType('shopify')}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${storeType === 'shopify'
                ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                : 'border-gray-100 hover:border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
            >
              <div className={`p-3 rounded-xl transition-colors ${storeType === 'shopify' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Store size={24} />
              </div>
              <span className="font-bold">Shopify</span>
            </button>
            <button
              onClick={() => setStoreType('woocommerce')}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${storeType === 'woocommerce'
                ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                : 'border-gray-100 hover:border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
            >
              <div className={`p-3 rounded-xl transition-colors ${storeType === 'woocommerce' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <LinkIcon size={24} />
              </div>
              <span className="font-bold">WooCommerce</span>
            </button>
          </div>
        </div>

        {/* Shopify Form */}
        {storeType === 'shopify' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Store Domain</label>
              <div className="relative group">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="example.myshopify.com"
                  onChange={(e) => updateForm('domain', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Admin Access Token</label>
              <div className="relative group">
                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  onChange={(e) => updateForm('accessToken', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* WooCommerce Form */}
        {storeType === 'woocommerce' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Site URL</label>
              <div className="relative group">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                  placeholder="https://yourstore.com"
                  onChange={(e) => updateForm('siteUrl', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Consumer Key</label>
                <div className="relative group">
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="ck_xxxxx"
                    onChange={(e) => updateForm('consumerKey', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Consumer Secret</label>
                <div className="relative group">
                  <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="cs_xxxxx"
                    type="password"
                    onChange={(e) => updateForm('consumerSecret', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {storeType && (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-50">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <LinkIcon size={20} />}
              Connect Platform
            </button>
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
              Sync All Products
            </button>
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border-2 animate-fadeIn ${message.includes('❌')
            ? 'bg-red-50 text-red-700 border-red-100'
            : message.includes('⏳')
              ? 'bg-amber-50 text-amber-700 border-amber-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
            {message.includes('❌') ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="flex-1">{message}</span>
            <button onClick={() => setMessage('')} className="text-xl leading-none opacity-40 hover:opacity-100 transition-opacity">&times;</button>
          </div>
        )}

        {!storeType && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Store size={48} className="opacity-20" />
            </div>
            <p className="max-w-[200px]">Choose a platform above to start the integration process</p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-5 bg-gray-50/30 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-50">
        Powered by Gazaarabia Sync Engine
      </div>
    </div>
  )
}
