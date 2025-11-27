import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to dashboard
  // TODO: Check auth state and redirect to login if not authenticated
  redirect('/dashboard');
}
