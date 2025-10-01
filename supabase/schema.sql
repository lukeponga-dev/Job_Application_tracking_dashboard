
-- Create the ENUM type for job application statuses
CREATE TYPE public.status_enum AS ENUM (
    'Applied',
    'Interviewing',
    'Offer',
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
  site_applied_on character varying(255) NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to the table and columns
COMMENT ON TABLE public.job_applications IS 'Stores job application information for users.';
COMMENT ON COLUMN public.job_applications.id IS 'Primary key for the job application.';
COMMENT ON COLUMN public.job_applications.user_id IS 'Foreign key to the user who owns this application.';
COMMENT ON COLUMN public.job_applications.job_title IS 'The title of the job applied for.';
COMMENT ON COLUMN public.job_applications.company_name IS 'The name of the company.';
COMMENT ON COLUMN public.job_applications.status IS 'The current status of the application.';
COMMENT ON COLUMN public.job_applications.date_applied IS 'The date the application was submitted.';
COMMENT ON COLUMN public.job_applications.site_applied_on IS 'The URL of the site where the application was made.';
COMMENT ON COLUMN public.job_applications.notes IS 'User-provided notes for the application.';
COMMENT ON COLUMN public.job_applications.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.job_applications.updated_at IS 'Timestamp of when the record was last updated.';


-- Create an index for faster queries on user_id and status
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status ON public.job_applications USING btree (user_id, status);

-- Create the trigger to update the 'updated_at' field on any row update
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for authenticated users" ON "public"."job_applications"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."job_applications"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON "public"."job_applications"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."job_applications"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
