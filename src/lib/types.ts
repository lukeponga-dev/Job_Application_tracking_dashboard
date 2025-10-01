import { z } from "zod";

export const statusEnum = z.enum(["Applied", "Interviewing", "Offer", "Rejected"]);

export type Status = z.infer<typeof statusEnum>;

export const applicationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  job_title: z.string().min(2, "Title must be at least 2 characters long."),
  company_name: z.string().min(2, "Company must be at least 2 characters long."),
  dateApplied: z.date({
    required_error: "A date of application is required.",
  }),
  status: statusEnum,
  site_applied_on: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional().nullable(),
});

export type JobApplication = z.infer<typeof applicationSchema>;
