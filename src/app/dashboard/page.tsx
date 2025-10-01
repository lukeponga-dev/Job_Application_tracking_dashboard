
import { getApplications } from '@/lib/supabase-service';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const applications = user ? await getApplications() : [];

  return <DashboardClient initialApplications={applications} />;
}
