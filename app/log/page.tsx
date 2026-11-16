import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

async function logService(formData: FormData) {
  'use server'
  const client_id = Number(formData.get('client_id'))
  const service_date = formData.get('service_date') as string
  const hours = Number(formData.get('hours'))
  const service_code = formData.get('service_code') as string
  const notes = formData.get('notes') as string

  await supabase.from('services').insert({
    client_id,
    service_date,
    hours,
    service_code,
    notes: notes || null,
  })
  redirect('/')
}

async function LogForm() {
  const { data: clients } = await supabase.from('clients').select('id, name').order('name')

  return (
    <form action={logService} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
        <select name="client_id" className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
          <option value="">Select client...</option>
          {(clients || []).map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          name="service_date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
        <input
          type="number"
          name="hours"
          step="0.25"
          min="0.25"
          placeholder="2.5"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Code</label>
        <select name="service_code" className="w-full border border-gray-300 rounded-lg px-3 py-2">
          <option>Personal Care</option>
          <option>Community Support</option>
          <option>Residential Support</option>
          <option>Behavioral Support</option>
          <option>Job Training</option>
          <option>Transportation</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Assisted with bathing, meal prep..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
      >
        Save
      </button>
    </form>
  )
}

export default function LogService() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Service</h1>
        <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
          <LogForm />
        </Suspense>
      </div>
    </div>
  )
}   