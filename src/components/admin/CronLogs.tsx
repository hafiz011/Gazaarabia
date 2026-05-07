// components/admin/CronLogs.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    History, 
    Database, 
    Users, 
    Download,
    Calendar,
    ArrowRight
} from 'lucide-react'

interface CronLog {
    id: number
    status: string
    totalSellers: number
    successful: number
    failed: number
    totalImported: number
    duration: number | null
    createdAt: string
}

export default function CronLogs() {
    const { data: session } = useSession()
    const [logs, setLogs] = useState<CronLog[]>([])
    const [loading, setLoading] = useState(true)
    const [triggering, setTriggering] = useState(false)
    const [message, setMessage] = useState('')

    async function fetchLogs() {
        if (!session?.user?.token) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cron/logs', {
                headers: { Authorization: `Bearer ${session.user.token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch logs')
            const data = await res.json()
            setLogs(data.logs || [])
        } catch (error) {
            console.error('Error fetching logs:', error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    async function handleManualTrigger() {
        if (!session?.user?.token) return
        setTriggering(true)
        setMessage('⏳ Syncing all sellers...')
        try {
            const res = await fetch('/api/admin/cron/trigger', {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.user.token}` }
            })
            const data = await res.json()
            setMessage(
                `✅ Done! Sellers: ${data.synced}, Imported: ${data.totalImported}, Failed: ${data.failed}`
            )
        } catch (error) {
            console.error('Trigger error:', error)
            setMessage('❌ Failed to trigger sync')
        } finally {
            setTriggering(false)
            fetchLogs()
        }
    }

    useEffect(() => {
        if (session?.user?.token) {
            fetchLogs()
        }
    }, [session])

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
                return 'bg-green-50 text-green-700 border-green-200 ring-green-500/10'
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-200 ring-red-500/10'
            case 'partial':
                return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/10'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
                return <CheckCircle2 size={14} className="mr-1" />
            case 'failed':
                return <AlertCircle size={14} className="mr-1" />
            case 'partial':
                return <AlertCircle size={14} className="mr-1" />
            default:
                return <RefreshCw size={14} className="mr-1 animate-spin" />
        }
    }

    // Stats calculations
    const totalImported = logs.reduce((acc, log) => acc + log.totalImported, 0)
    const lastSync = logs[0]?.createdAt ? new Date(logs[0].createdAt).toLocaleString() : 'Never'

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <History size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Syncs</p>
                        <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <Download size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Imported</p>
                        <p className="text-2xl font-bold text-gray-900">{totalImported.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Last Sync</p>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{lastSync}</p>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Database size={20} className="text-blue-600" />
                            Cron Sync History
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Monitor and trigger automated store synchronizations</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={fetchLogs}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 bg-white"
                            title="Refresh Logs"
                        >
                            <RefreshCw size={20} className={loading && !triggering ? 'animate-spin' : ''} />
                        </button>
                        
                        <button
                            onClick={handleManualTrigger}
                            disabled={triggering}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                        >
                            {triggering ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <RefreshCw size={18} />
                            )}
                            {triggering ? 'Processing...' : 'Manual Sync Now'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mx-6 mt-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
                        message.includes('❌') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                        <div className="flex-1">{message}</div>
                        <button onClick={() => setMessage('')} className="text-lg opacity-50 hover:opacity-100">&times;</button>
                    </div>
                )}

                {/* Table Section */}
                <div className="overflow-x-auto">
                    {loading && logs.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                            <RefreshCw size={40} className="animate-spin mb-4 text-blue-100" />
                            <p>Loading synchronization logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                            <History size={40} className="mb-4 text-gray-200" />
                            <p className="font-medium">No synchronization logs found</p>
                            <button 
                                onClick={handleManualTrigger}
                                className="mt-4 text-blue-600 hover:underline text-sm font-semibold"
                            >
                                Trigger your first sync now
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sellers</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Results</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Imported</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ring-1 ring-inset shadow-sm ${getStatusStyle(log.status)}`}>
                                                {getStatusIcon(log.status)}
                                                {log.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <Users size={16} className="text-gray-400" />
                                                {log.totalSellers}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs font-semibold">
                                                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                    <CheckCircle2 size={12} className="mr-1" />
                                                    {log.successful}
                                                </div>
                                                <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                                    <AlertCircle size={12} className="mr-1" />
                                                    {log.failed}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700 font-bold">
                                                <Download size={16} className="text-blue-400" />
                                                {log.totalImported.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Clock size={16} className="text-gray-300" />
                                                {log.duration ? (
                                                    <span>{log.duration >= 1000 ? `${(log.duration / 1000).toFixed(2)}s` : `${log.duration}ms`}</span>
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <Clock size={12} />
                                                    {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Footer / Pagination Placeholder */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <p>Showing {logs.length} most recent sync sessions</p>
                    <div className="flex items-center gap-1 text-blue-600 font-semibold cursor-pointer hover:underline">
                        View Audit Logs <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    )
}
