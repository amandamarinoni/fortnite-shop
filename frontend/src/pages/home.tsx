import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home(){
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/cosmetics')
      .then(r => setItems(r.data.items || []))
      .catch(() => setItems([]));
  }, []);
  return (
    <div>
      <h1 className="text-2xl mb-4">Cosméticos</h1>
      <div className="grid grid-cols-4 gap-4">
        {items.map(i => (
          <div key={i.id} className="border p-2">
            <img src={i.imageUrl} alt={i.name} className="w-full h-40 object-cover" />
            <div className="mt-2">
              <div className="font-bold">{i.name}</div>
              <div className="text-sm">R$ {i.priceVbucks} v-bucks</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
