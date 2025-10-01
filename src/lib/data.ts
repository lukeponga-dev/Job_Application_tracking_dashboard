import type { JobApplication } from "./types";

export const initialApplications: JobApplication[] = [
  {
    id: "1",
    title: "Software Engineer",
    company: "Tech Solutions Inc.",
    dateApplied: new Date("2024-07-15"),
    status: "Interviewing",
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "Creative Designs LLC",
    dateApplied: new Date("2024-07-10"),
    status: "Applied",
  },
  {
    id: "3",
    title: "Product Manager",
    company: "Innovate Co.",
    dateApplied: new Date("2024-07-05"),
    status: "Rejected",
  },
  {
    id: "4",
    title: "UX Designer",
    company: "UserFirst Agency",
    dateApplied: new Date("2024-06-20"),
    status: "Applied",
  },
  {
    id: "5",
    title: "Backend Engineer",
    company: "Data Systems",
    dateApplied: new Date("2024-06-18"),
    status: "Offer",
  },
  {
    id: "6",
    title: "Full Stack Developer",
    company: "Web Weavers",
    dateApplied: new Date("2024-07-20"),
    status: "Applied",
  },
];
