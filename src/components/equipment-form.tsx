'use client';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { authenticatedFetch } from '@/lib/auth-client';
import { categories, type Equipment } from '@/lib/equipment';
export function EquipmentForm({ item, onSaved }: { item?: Equipment; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setBusy(true); setError('');
    try {
      let image = item?.image;
      const file = data.get('file') as File;
      if (file?.size) {
        if (file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.');
        image = (await authenticatedFetch('/api/uploads', { method: 'POST', body: file, headers: { 'Content-Type': file.type } })).url;
      }
      const body = Object.fromEntries(data); delete body.file;
      await authenticatedFetch(`/api/equipment${item ? `/${item._id}` : ''}`, { method: item ? 'PATCH' : 'POST', body: JSON.stringify({ ...body, image, price: Number(data.get('price')), quantity: Number(data.get('quantity')) }) });
      toast.success(item ? 'Equipment updated.' : 'Equipment submitted for approval.'); form.reset(); onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save equipment.'); } finally { setBusy(false); }
  }
  return <form className="equipment-form" onSubmit={submit}><div className="form-heading"><h2>{item ? 'Update equipment' : 'List your equipment'}</h2><p>Give renters the details they need. New listings are reviewed before going live.</p></div>{(['name','location','brand','model','condition'] as const).map(field => <label key={field}>{field === 'name' ? 'Equipment name' : field}<input name={field} required maxLength={200} defaultValue={item?.[field]}/></label>)}<label>Category<select name="category" required defaultValue={item?.category || ''}><option value="" disabled>Choose a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Rental price (BDT)<input name="price" type="number" min="0.01" step="0.01" required defaultValue={item?.price}/></label><label>Rental type<select name="rentalType" defaultValue={item?.rentalType || 'daily'}>{['daily','weekly','monthly'].map(t => <option key={t}>{t}</option>)}</select></label><label>Available quantity<input name="quantity" type="number" min="0" step="1" required defaultValue={item?.quantity ?? 1}/></label><label>Equipment photo<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required={!item}/><small>JPEG, PNG, or WebP. Maximum 5 MB. Uploaded securely to imgbb.</small></label><label className="form-wide">Description<textarea name="description" required maxLength={5000} rows={5} defaultValue={item?.description}/></label><label className="form-wide">Rental terms and conditions<textarea name="terms" required maxLength={5000} rows={4} defaultValue={item?.terms}/></label>{error && <p className="form-error form-wide" role="alert">{error}</p>}<div className="form-wide"><button disabled={busy} className="button dark">{busy ? 'Uploading and saving…' : item ? 'Save changes' : 'Submit for approval'}</button></div></form>;
}
