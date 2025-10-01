
"use client";
import React, { useState, useMemo } from 'react';
import { MoreHorizontal, PlusCircle, Award, FileText, Users, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { JobApplication, Status } from '@/lib/types';
import ApplicationForm from './application-form';
import { format } from 'date-fns';

interface ApplicationsTableProps {
  applications: JobApplication[];
  onAdd: (app: Omit<JobApplication, 'id'>) => Promise<void>;
  onUpdate: (app: JobApplication) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusIcons: Record<Status, React.ElementType> = {
  Applied: FileText,
  Interviewing: Users,
  Offer: Award,
  Rejected: XCircle,
};

export default function ApplicationsTable({ applications, onAdd, onUpdate, onDelete }: ApplicationsTableProps) {
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>(undefined);

  const handleAddClick = () => {
    setEditingApplication(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (app: JobApplication) => {
    setEditingApplication(app);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    onDelete(id);
  }

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
  }, [applications]);
  
  const filteredApplications = useMemo(() => {
    if (filter === 'All') return sortedApplications;
    return sortedApplications.filter(app => app.status === filter);
  }, [sortedApplications, filter]);
  
  const tabs: (Status | 'All')[] = ['All', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  return (
    <>
      <ApplicationForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        application={editingApplication}
        onAdd={onAdd}
        onUpdate={onUpdate}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>My Applications</CardTitle>
            <Button onClick={handleAddClick} size="sm" className="gap-2 shrink-0">
              <PlusCircle className="h-4 w-4" />
              Add Application
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as Status | 'All')}>
              <div className="overflow-x-auto">
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map(app => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="font-medium">{app.job_title}</div>
                          <div className="text-sm text-muted-foreground">{app.company_name}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{format(new Date(app.dateApplied), 'LLL dd, y')}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'Rejected' ? 'destructive' : app.status.toLowerCase() as any} className="gap-1 items-center">
                             {React.createElement(statusIcons[app.status], { className: "h-3 w-3"})}
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleEditClick(app)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDeleteClick(app.id!)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No applications found for this status.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
