
import { JobApplication } from './types';
import Papa from 'papaparse';

const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const exportToCSV = (applications: JobApplication[]) => {
  const data = applications.map(app => ({
    'Job Title': app.job_title,
    'Company': app.company_name,
    'Date Applied': app.dateApplied.toLocaleDateString(),
    'Status': app.status,
    'Applied On': app.site_applied_on,
    'Notes': app.notes,
    'Rejection Reason': app.rejection_reason,
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, 'job_applications.csv', 'text/csv;charset=utf-8;');
};

export const exportToJSON = (applications: JobApplication[]) => {
  const json = JSON.stringify(applications, null, 2);
  downloadFile(json, 'job_applications.json', 'application/json');
};
