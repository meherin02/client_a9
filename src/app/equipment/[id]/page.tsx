import { Suspense } from 'react';
import EquipmentDetails from '@/components/equipment-details';
export default function DetailsPage() {
  return <Suspense fallback={<main className="details"><p role="status">Loading equipment details…</p></main>}><EquipmentDetails/></Suspense>;
}
