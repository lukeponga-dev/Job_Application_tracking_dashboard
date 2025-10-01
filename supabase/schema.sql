-- Create the ENUM type for job application status
CREATE TYPE public.status_enum AS ENUM (
    'Applied',
    'Interviewing',
,'Offer',
    'Rejected'
);

-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the job_applications table
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_title character varying(255) NOT NULL,
  company_name character varying(255) NOT NULL,
  status public.status_enum NOT NULL DEFAULT 'Applied'::status_enum,
  date_applied date NOT NULL,
  site_applied_on character varying(255),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to the table and columns
COMMENT ON TABLE public.job_applications IS 'Stores job application records for users.';
COMMENT ON COLUMN public.job_applications.job_title IS 'The title of the job applied for.';
COMMENT ON COLUMN public.job_applications.company_name IS 'The name of the company.';
COMMENT ON COLUMN public.job_applications.status IS 'The current status of the application.';
COMMENT ON COLUMN public.job_applications.date_applied IS 'The date the application was submitted.';
COMMENT ON COLUMN public.job_applications.site_applied_on IS 'The URL of the job posting or where the application was made.';
COMMENT ON COLUMN public.job_applications.notes IS 'User notes about the application.';

-- Create an index for faster queries on user_id and status
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status ON public.job_applications USING btree (user_id, status);

-- Create a trigger to update the 'updated_at' timestamp on any row update
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow individual read access" ON public.job_applications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert access" ON public.job_applications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual update access" ON public.job_applications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow individual delete access" ON public.job_applications
FOR DELETE USING (auth.uid() = user_id);
