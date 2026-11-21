import Link from 'next/link';
import Image from 'next/image';
import { type Equipment, money } from '@/lib/equipment';
export function EquipmentCard({ item }: { item: Equipment }) {
  return <article className="equipment-card"><div className="equipment-image"><Image unoptimized fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" src={item.image} alt={item.name}/><span className={`stock ${item.quantity ? '' : 'unavailable'}`}>{item.quantity ? 'Available' : 'Unavailable'}</span></div><div className="equipment-card-body"><p className="eyebrow">{item.category}</p><h3>{item.name}</h3><p className="muted">{item.location}</p><div className="card-bottom"><p><strong>{money(item.price)}</strong><span> / {item.rentalType === 'daily' ? 'day' : item.rentalType === 'weekly' ? 'week' : 'month'}</span></p><Link className="button dark" href={`/equipment/${item._id}`}>View details</Link></div></div></article>;
}
