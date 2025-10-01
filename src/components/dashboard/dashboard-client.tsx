
"use client";

import { useState, useEffect } from 'react';
import type { JobApplication } from '@/lib/types';
import ApplicationsTable from '@/components/dashboard/applications-table';
import StatsCards from '@/components/dashboard/stats-cards';
import VisualizationSuggestions from '@/components/dashboard/visualization-suggestions';
import { getApplications, createApplication, updateApplication as updateApplicationInDb, deleteApplication as deleteApplicationFromDb } from '@/lib/supabase-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import StatusDistributionChart from '@/components/dashboard/status-distribution-chart';
import ApplicationsOverTimeChart from '@/components/dashboard/applications-over-time-chart';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import ApplicationForm from './application-form';

interface DashboardClientProps {
  initialApplications: JobApplication[];
}

export default function DashboardClient({ initialApplications }: DashboardClientProps) {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>(undefined);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const handleAddClick = () => {
    setEditingApplication(undefined);
    setIsFormOpen(true);
  };

  const addApplication = async (app: Omit<JobApplication, 'id' | 'user_id'>) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to add an application.',
        });
        return;
    }
    try {
      const newApplication = await createApplication(app);
      if (newApplication) {
        setApplications(prev => [newApplication, ...prev]);
        toast({ title: "Application Added", description: `Your new application for ${app.job_title} has been added.` });
      }
    } catch(error) {
        console.error('Error adding application:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add job application.',
        });
    }
  };

  const updateApplication = async (app: JobApplication) => {
    try {
        const updatedApp = await updateApplicationInDb(app);
        if(updatedApp) {
            setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
            toast({ title: "Application Updated", description: `Details for ${app.job_title} at ${app.company_name} have been saved.` });
        }
    } catch (error) {
        console.error('Error updating application:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update job application.',
        });
    }
  };

  const deleteApplication = async (id: string) => {
    try {
        await deleteApplicationFromDb(id);
        setApplications(prev => prev.filter(a => a.id !== id));
        toast({ title: "Application Deleted", description: `Application has been deleted.` });
    } catch (error) {
        console.error('Error deleting application:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete job application.',
        });
    }
  };
  
  const deleteMultipleApplications = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteApplicationFromDb(id)));
      setApplications(prev => prev.filter(a => !ids.includes(a.id)));
      toast({ title: "Applications Deleted", description: `${ids.length} applications have been deleted.` });
    } catch (error) {
      console.error('Error deleting multiple applications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete selected applications.',
      });
    }
  };

  return (
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <ApplicationForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            application={editingApplication}
            onAdd={addApplication}
            onUpdate={updateApplication}
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Applications</h1>
            <Button onClick={handleAddClick} size="sm" className="gap-2 shrink-0">
              <PlusCircle className="h-4 w-4" />
              Add Application
            </Button>
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <StatsCards applications={applications} />
        )}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <ApplicationsTable
                applications={applications}
                onAdd={addApplication}
                onUpdate={updateApplication}
                onDelete={deleteApplication}
                onDeleteMultiple={deleteMultipleApplications}
              />
            )}
          </div>
          <div className="lg:col-span-1 space-y-8">
            {isLoading ? (
                <Skeleton className="h-[300px]" />
            ) : (
                <StatusDistributionChart applications={applications} />
            )}
            {isLoading ? (
                <Skeleton className="h-[300px]" />
            ) : (
                <ApplicationsOverTimeChart applications={applications} />
            )}
            {isLoading ? (
                <Skeleton className="h-[300px]" />
            ) : (
                <VisualizationSuggestions applications={applications} />
            )}
          </div>
        </div>
      </div>
  );
}
