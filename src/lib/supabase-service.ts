'use server';

import { cookies } from 'next/headers';
import { createClient as createServerClient } from './supabase/server';
import { JobApplication, applicationSchema } from './types';
import { unstable_noStore as noStore } from 'next/cache';

const fromApiResponse = (item: any): JobApplication => {
    const jobApplication: JobApplication = {
        id: item.id,
        user_id: item.user_id,
        job_title: item.job_title,
        company_name: item.company_name,
        dateApplied: new Date(item.date_applied),
        status: item.status,
        site_applied_on: item.site_applied_on || null,
        notes: item.notes || null,
        rejection_reason: item.rejection_reason || null,
    };
    return applicationSchema.parse(jobApplication);
};

export async function getApplications(): Promise<JobApplication[]> {
    noStore();
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('date_applied', { ascending: false });

    if (error) {
        console.error('Error fetching applications:', error);
        throw new Error('Failed to fetch job applications.');
    }

    return data.map(fromApiResponse);
}

export async function createApplication(application: Omit<JobApplication, 'id' | 'user_id'>): Promise<JobApplication | null> {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }
    
    const { job_title, company_name, dateApplied, status, site_applied_on, notes, rejection_reason } = application;
    
    const { data, error } = await supabase
        .from('job_applications')
        .insert([{ 
            job_title, 
            company_name, 
            date_applied: dateApplied.toISOString().slice(0, 10), 
            status, 
            site_applied_on: site_applied_on || null,
            notes: notes || null,
            rejection_reason: rejection_reason || null,
            user_id: user.id
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating application:', error);
        throw new Error('Failed to create job application.');
    }

    return fromApiResponse(data);
}

export async function createMultipleApplications(applications: Omit<JobApplication, 'id' | 'user_id'>[]): Promise<JobApplication[]> {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const applicationsToInsert = applications.map(app => ({
        ...app,
        date_applied: app.dateApplied.toISOString().slice(0, 10),
        user_id: user.id,
    }));
    
    // Remove dateApplied from the objects to match the database schema
    const dbReadyApps = applicationsToInsert.map(({ dateApplied, ...rest }) => rest);


    const { data, error } = await supabase
        .from('job_applications')
        .insert(dbReadyApps)
        .select();

    if (error) {
        console.error('Error creating multiple applications:', error);
        throw new Error('Failed to create multiple job applications.');
    }

    return data.map(fromApiResponse);
}


export async function updateApplication(application: JobApplication): Promise<JobApplication | null> {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
     const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { id, job_title, company_name, dateApplied, status, site_applied_on, notes, rejection_reason } = application;

    const { data, error } = await supabase
        .from('job_applications')
        .update({ 
            job_title, 
            company_name, 
            date_applied: dateApplied.toISOString().slice(0, 10), 
            status, 
            site_applied_on: site_applied_on || null,
            notes: notes || null,
            rejection_reason: status === 'Rejected' ? rejection_reason : null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating application:', error);
        throw new Error('Failed to update job application.');
    }

    return fromApiResponse(data);
}

export async function deleteApplication(id: string): Promise<void> {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting application:', error);
        throw new Error('Failed to delete job application.');
    }
}
