
"use client";

import { useState, useEffect, useRef } from 'react';
import type { JobApplication } from '@/lib/types';
import ApplicationsTable from '@/components/dashboard/applications-table';
import StatsCards from '@/components/dashboard/stats-cards';
import VisualizationSuggestions from '@/components/dashboard/visualization-suggestions';
import { getApplications, createApplication, updateApplication as updateApplicationInDb, deleteApplication as deleteApplicationFromDb, createMultipleApplications } from '@/lib/supabase-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import StatusDistributionChart from '@/components/dashboard/status-distribution-chart';
import ApplicationsOverTimeChart from '@/components/dashboard/applications-over-time-chart';
import { Button } from '../ui/button';
import { PlusCircle, Download, Upload } from 'lucide-react';
import ApplicationForm from './application-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { exportToCSV, exportToJSON } from '@/lib/export';
import Papa from 'papaparse';
import { Input } from '../ui/input';
import { applicationSchema, statusEnum } from '@/lib/types';

interface DashboardClientProps {
  initialApplications: JobApplication[];
}

export default function DashboardClient({ initialApplications }: DashboardClientProps) {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const handleAddClick = () => {
    setEditingApplication(undefined);
    setIsFormOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Try creating a date directly, works for YYYY-MM-DD
    const directDate = new Date(dateString);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    // Handle MM/DD/YYYY
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            // new Date(year, monthIndex, day)
            const year = parseInt(parts[2], 10);
            const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
            const day = parseInt(parts[1], 10);
            
            // Basic validation
            if(year > 1900 && month >= 0 && month < 12 && day > 0 && day <= 31) {
                const parsed = new Date(year, month, day);
                if (!isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
        }
    }
    
    return null; // Return null if parsing fails
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const parsedApps = results.data.map((row: any) => {
              const dateApplied = parseDate(row.dateApplied || row['Date Applied']);
              if (!dateApplied) {
                throw new Error(`Invalid or missing date format for row: ${JSON.stringify(row)}`);
              }
              return {
                job_title: row.job_title || row['Job Title'] || '',
                company_name: row.company_name || row['Company'] || '',
                dateApplied: dateApplied,
                status: statusEnum.parse(row.status || row['Status'] || 'Applied'),
                site_applied_on: row.site_applied_on || row['Applied On'] || null,
                notes: row.notes || row['Notes'] || null,
                rejection_reason: row.rejection_reason || row['Rejection Reason'] || null,
              };
            }).filter(app => app.job_title && app.company_name);

            if (parsedApps.length === 0) {
              toast({
                variant: 'destructive',
                title: 'Import Failed',
                description: 'CSV file is empty or does not contain valid data.',
              });
              return;
            }
            
            const newApplications = await createMultipleApplications(parsedApps);
            setApplications(prev => [...newApplications, ...prev]);

            toast({
              title: 'Import Successful',
              description: `${newApplications.length} new applications have been added.`,
            });
          } catch (error) {
            console.error('Error importing applications:', error);
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: (error as Error).message || 'Could not parse CSV file. Please check the format.',
            });
          } finally {
            setIsLoading(false);
            // Reset file input
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
          }
        },
        error: (error) => {
            console.error('Error parsing CSV:', error);
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: 'An error occurred while parsing the CSV file.',
            });
            setIsLoading(false);
        }
      });
    }
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
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Applications</h1>
            <div className="flex items-center gap-2">
              <Button onClick={handleImportClick} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => exportToCSV(applications)}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportToJSON(applications)}>Export as JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleAddClick} size="sm" className="gap-2 shrink-0">
                <PlusCircle className="h-4 w-4" />
                Add Application
              </Button>
            </div>
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

    