
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, PlusCircle, Award, FileText, Users, XCircle, Trash2 } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';

interface ApplicationsTableProps {
  applications: JobApplication[];
  onAdd: (app: Omit<JobApplication, 'id' | 'user_id'>) => Promise<void>;
  onUpdate: (app: JobApplication) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
}

const statusIcons: Record<Status, React.ElementType> = {
  Applied: FileText,
  Interviewing: Users,
  Offer: Award,
  Rejected: XCircle,
};

export default function ApplicationsTable({ applications, onAdd, onUpdate, onDelete, onDeleteMultiple }: ApplicationsTableProps) {
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const handleAddNewClick = () => {
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

  const handleDeleteMultiple = () => {
    onDeleteMultiple(selectedRows);
    setSelectedRows([]);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredApplications.map(app => app.id));
    } else {
      setSelectedRows([]);
    }
  }

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  }

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
  }, [applications]);
  
  const filteredApplications = useMemo(() => {
    if (filter === 'All') return sortedApplications;
    return sortedApplications.filter(app => app.status === filter);
  }, [sortedApplications, filter]);
  
  useEffect(() => {
    setSelectedRows([]);
  }, [filter]);

  const tabs: (Status | 'All')[] = ['All', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  const getBadgeVariant = (status: Status) => {
    switch (status) {
      case 'Applied': return 'applied';
      case 'Interviewing': return 'interviewing';
      case 'Offer': return 'offer';
      case 'Rejected': return 'destructive';
      default: return 'default';
    }
  }

  const EmptyState = () => (
    <div className="text-center h-48 flex flex-col justify-center items-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {filter === 'All' ? 'No Applications Yet' : `No ${filter} Applications`}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {filter === 'All' ? 'Get started by adding your first job application.' : `You haven't marked any applications as ${filter}.`}
      </p>
      {filter === 'All' && (
         <Button onClick={handleAddNewClick} size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add First Application
        </Button>
      )}
    </div>
  );

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
        <CardContent className='pt-6'>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as Status | 'All')}>
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto flex-wrap">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {selectedRows.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg my-4">
                    <div className="text-sm font-medium">
                        {selectedRows.length} of {filteredApplications.length} selected
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteMultiple}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedRows.length})
                    </Button>
                </div>
            )}
            
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead padding="checkbox" className="w-12">
                        <Checkbox
                            checked={selectedRows.length > 0 && selectedRows.length === filteredApplications.length}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map(app => (
                      <TableRow key={app.id} data-state={selectedRows.includes(app.id) && "selected"}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={selectedRows.includes(app.id)}
                                onCheckedChange={() => handleRowSelect(app.id)}
                                aria-label="Select row"
                            />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{app.job_title}</div>
                          <div className="text-sm text-muted-foreground">{app.company_name}</div>
                        </TableCell>
                        <TableCell>{format(new Date(app.dateApplied), 'LLL dd, y')}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(app.status)} className="gap-1 items-center">
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
                      <TableCell colSpan={5}>
                         <EmptyState />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mt-4">
               {filteredApplications.length > 0 ? (
                filteredApplications.map(app => (
                  <Card key={app.id} className="w-full" data-state={selectedRows.includes(app.id) && "selected"}>
                    <CardContent className="p-4 flex gap-4">
                        <div className='pt-1'>
                            <Checkbox
                                checked={selectedRows.includes(app.id)}
                                onCheckedChange={() => handleRowSelect(app.id)}
                                aria-label="Select row"
                            />
                        </div>
                        <div className="flex flex-col gap-4 flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">{app.job_title}</div>
                                    <div className="text-sm text-muted-foreground">{app.company_name}</div>
                                </div>
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
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <Badge variant={getBadgeVariant(app.status)} className="gap-1 items-center">
                                  {React.createElement(statusIcons[app.status], { className: "h-3 w-3"})}
                                  {app.status}
                              </Badge>
                              <span className="text-muted-foreground">{format(new Date(app.dateApplied), 'LLL dd, y')}</span>
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                ))
                ) : (
                    <EmptyState />
                )}
            </div>
        </CardContent>
      </Card>
    </>
  );
}
