interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
    paid: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-orange-100 text-orange-800 border-orange-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-green-600 text-white border-green-700',
    disputed: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
