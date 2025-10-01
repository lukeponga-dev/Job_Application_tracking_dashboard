import { z } from "zod";

export const statusEnum = z.enum(["Applied", "Interviewing", "Offer", "Rejected"]);

export type Status = z.infer<typeof statusEnum>;

export const applicationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters long."),
  company: z.string().min(2, "Company must be at least 2 characters long."),
  dateApplied: z.date({
    required_error: "A date of application is required.",
  }),
  status: statusEnum,
  site_applied_on: z.string().url().optional().or(z.literal('')),
});

export type JobApplication = z.infer<typeof applicationSchema>;
