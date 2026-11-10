// Planted: a real data table over a table that grows without limit, with no row bound.
import { useEffect, useState } from 'react';

type Order = { id: string; customer: string; total: number; status: string; placedAt: string };

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch('/api/orders?all=true').then((r) => r.json()).then(setOrders);
  }, []);
  return (
    <table>
      <thead>
        <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.total}</td><td>{o.status}</td><td>{o.placedAt}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
