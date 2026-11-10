// Planted: a server-paged table that follows the pagination standard. A failed page never shows another page's rows.
import { useEffect, useState } from 'react';

type Order = { id: string; customer: string; total: number };
type Page = { rows: Order[]; nextCursor: string | null };
type View = { state: 'loading' } | { state: 'error' } | { state: 'ready'; page: Page };

const PAGE_SIZE = 50;

export function OrdersPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [view, setView] = useState<View>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const after = cursor ? `&after=${encodeURIComponent(cursor)}` : '';
    setView({ state: 'loading' });
    fetch(`/api/orders?limit=${PAGE_SIZE}${after}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((page: Page) => setView({ state: 'ready', page }))
      .catch(() => setView({ state: 'error' }));
  }, [cursor, attempt]);
  return (
    <div>
      <table aria-busy={view.state === 'loading'}>
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Total</th></tr>
        </thead>
        <tbody>
          {view.state === 'ready' && view.page.rows.map((o) => (
            <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.total}</td></tr>
          ))}
        </tbody>
      </table>
      {view.state === 'loading' && <p role="status">Loading orders…</p>}
      {view.state === 'error' && <p role="alert">Orders could not be loaded. <button onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
      {view.state === 'ready' && view.page.rows.length === 0 && <p>No orders yet.</p>}
      <button disabled={view.state !== 'ready' || !view.page.nextCursor} onClick={() => view.state === 'ready' && setCursor(view.page.nextCursor)}>Next</button>
    </div>
  );
}
