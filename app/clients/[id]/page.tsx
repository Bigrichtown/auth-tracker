import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Suspense } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

async function ClientContent({ id }: { id: string }) {
  const clientId = Number(id)
  const { data: client } = await supabase.from('clients').select('*').eq('id', clientId).single()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('client_id', clientId)
    .order('service_date', { ascending: false })

  if (!client) {
    return <div className="p-6">Client not found. <Link href="/" className="text-blue-600">Go back</Link></div>
  }

  const totalUsed = (services || []).reduce((sum: number, s: any) => sum + Number(s.hours), 0)
  const remaining = Number(client.authorized_hours) - totalUsed

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h1>
      <p className="text-gray-600 mb-4">{client.waiver_type} — {client.state}</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Authorized</p>
          <p className="text-xl font-bold">{client.authorized_hours} hrs</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Used</p>
          <p className="text-xl font-bold">{totalUsed} hrs</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>{remaining} hrs</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Service History</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Hours</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Code</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Notes</th>
            </tr>
          </thead>
          <tbody>
            {(services || []).length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No services logged yet</td></tr>
            ) : (
              (services || []).map((s: any) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{s.service_date}</td>
                  <td className="px-4 py-2 text-right">{s.hours}</td>
                  <td className="px-4 py-2">{s.service_code}</td>
                  <td className="px-4 py-2 text-gray-500 text-sm">{s.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

async function ParamsWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClientContent id={id} />
}

export default function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm mb-4 inline-block">← Back to dashboard</Link>
        <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
          <ParamsWrapper params={params} />
        </Suspense>
      </div>
    </div>
  )
}   