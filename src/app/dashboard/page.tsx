
"use client";

import { useState } from 'react';
import { initialApplications } from '@/lib/data';
import type { JobApplication } from '@/lib/types';
import ApplicationsTable from '@/components/dashboard/applications-table';
import StatsCards from '@/components/dashboard/stats-cards';
import VisualizationSuggestions from '@/components/dashboard/visualization-suggestions';
import DashboardLayout from './layout';

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);

  const addApplication = (app: Omit<JobApplication, 'id'>) => {
    setApplications(prev => [...prev, { ...app, id: Date.now().toString() }]);
  };

  const updateApplication = (app: JobApplication) => {
    setApplications(prev => prev.map(a => a.id === app.id ? app : a));
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">JobTracker Dashboard</h1>
        </div>
        <StatsCards applications={applications} />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ApplicationsTable
              applications={applications}
              onAdd={addApplication}
              onUpdate={updateApplication}
              onDelete={deleteApplication}
            />
          </div>
          <div className="lg:col-span-1">
            <VisualizationSuggestions applications={applications} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
