// Planted: a modal said to follow the standard, with no focus handling or keyboard dismissal.
export function ConfirmDialog({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="mx-auto mt-32 w-96 rounded bg-white p-4">
        <p>Delete this project? This cannot be undone.</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Delete</button>
      </div>
    </div>
  );
}
