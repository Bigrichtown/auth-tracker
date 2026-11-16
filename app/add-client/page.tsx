import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)   
import { redirect } from 'next/navigation'
async function addClient(formData:
FormData) {
'use server'
  const name = formData.get('name') as
string
  const waiver_type =
formData.get('waiver_type') as string
  const authorized_hours =
Number(formData.get('authorized_hours'))
  const state = formData.get('state') as string
  await supabase.from('clients').insert({ name,
waiver_type, authorized_hours, state })
  redirect('/')
}
export default function AddClient() {
  return (
    <div className="min-h-screen bg-gray-50
p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold
text-gray-900 mb-6">Add Client</h1>
        <form action={addClient}
className="bg-white rounded-lg shadow-sm
p-6 space-y-4">
          <div>
            <label className="block text-sm
font-medium text-gray-700 mb-1">Full
Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Smith"
              className="w-full border
border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm
font-medium text-gray-700 mb-1">Waiver
Type</label>
            <input
              type="text"
              name="waiver_type"
              placeholder="Community First"
              className="w-full border
border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm
font-medium text-gray-700 mb-1">Authorized
Hours / Month</label>
            <input
              type="number"
              name="authorized_hours"
              step="1"
              min="1"
              placeholder="120"
              className="w-full border
border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm
font-medium text-gray-700 mb-1">State</
label>
            <input
              type="text"
              name="state"
              placeholder="TX"
              maxLength={2}
              className="w-full border
border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600
text-white py-2 rounded-lg hover:bg-blue-700
font-medium"
          >
            Add Client
          </button>
        </form>
      </div>
    </div>
  )
}   