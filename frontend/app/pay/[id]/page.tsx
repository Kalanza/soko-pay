import { redirect } from 'next/navigation';

/**
 * The backend generates payment links as /pay/{order_id}.
 * This page redirects to /buy/{id} where the actual buy flow lives.
 */
export default async function PayRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/buy/${id}`);
}
