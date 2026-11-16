import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Suspense } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

async function DashboardContent() {
  const { data: clients } = await supabase.from('clients').select('*')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .gte('service_date', monthStart.toISOString().split('T')[0])

  const clientRows = (clients || []).map((client: any) => {
    const clientServices = (services || []).filter((s: any) => s.client_id === client.id)
    const used = clientServices.reduce((sum: number, s: any) => sum + Number(s.hours), 0)
    const remaining = Number(client.authorized_hours) - used
    const pct = Number(client.authorized_hours) > 0 ? (remaining / Number(client.authorized_hours)) * 100 : 0
    return { ...client, used, remaining, pct }
  })

  clientRows.sort((a: any, b: any) => a.pct - b.pct)

  const totalAuthorized = clientRows.reduce((s: number, c: any) => s + Number(c.authorized_hours), 0)
  const totalUsed = clientRows.reduce((s: number, c: any) => s + c.used, 0)
  const totalRemaining = totalAuthorized - totalUsed
  const lowCount = clientRows.filter((c: any) => c.pct < 10).length

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Authorized (This Month)</p>
        <p className="text-2xl font-bold text-gray-900">{totalAuthorized} hrs</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Delivered</p>
        <p className="text-2xl font-bold text-gray-900">{totalUsed} hrs</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Remaining</p>
        <p className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>{totalRemaining} hrs</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Waiver Authorization Tracker</h1>
          <div className="flex gap-2">
            <Link href="/add-client" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">+ Add Client</Link>
            <Link href="/log" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">+ Log Service</Link>
          </div>
        </div>

        <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
          <DashboardContent />
        </Suspense>

        <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
          <ClientTable />
        </Suspense>
      </div>
    </div>
  )
}

async function ClientTable() {
  const { data: clients } = await supabase.from('clients').select('*')
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .gte('service_date', monthStart.toISOString().split('T')[0])

  const clientRows = (clients || []).map((client: any) => {
    const clientServices = (services || []).filter((s: any) => s.client_id === client.id)
    const used = clientServices.reduce((sum: number, s: any) => sum + Number(s.hours), 0)
    const remaining = Number(client.authorized_hours) - used
    const pct = Number(client.authorized_hours) > 0 ? (remaining / Number(client.authorized_hours)) * 100 : 0
    return { ...client, used, remaining, pct }
  })

  clientRows.sort((a: any, b: any) => a.pct - b.pct)
  const lowCount = clientRows.filter((c: any) => c.pct < 10).length

  return (
    <>
      {lowCount > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          ⚠ {lowCount} client{lowCount > 1 ? 's' : ''} below 10% remaining hours
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Client</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Waiver</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Authorized</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Used</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Remaining</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {clientRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No clients yet. Add your first client to get started.</td>
              </tr>
            ) : (
              clientRows.map((c: any) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.waiver_type}</td>
                  <td className="px-4 py-3 text-right">{c.authorized_hours} hrs</td>
                  <td className="px-4 py-3 text-right">{c.used} hrs</td>
                  <td className={`px-4 py-3 text-right font-medium ${c.remaining < 0 ? 'text-red-600' : ''}`}>{c.remaining} hrs</td>
                  <td className="px-4 py-3 text-center">
                    {c.pct < 10 ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">LOW</span>
                    ) : c.pct < 25 ? (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">WARNING</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">OK</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}   