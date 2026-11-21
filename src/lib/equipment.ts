export const categories = ['Construction', 'Photography', 'Vehicles', 'Agriculture', 'Electronics', 'Events'];
export type Equipment = { _id: string; name: string; description: string; category: string; location: string; price: number; rentalType: string; quantity: number; condition: string; brand: string; model: string; image: string; terms: string; status: string; owner: { name: string; email: string } };
export const money = (amount: number) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(amount);
