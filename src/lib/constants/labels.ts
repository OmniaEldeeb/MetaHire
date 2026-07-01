import type {
  ApplicationStatus,
  ExperienceLevel,
  WorkModel,
  WorkType,
} from "./enums";

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  intern: "Intern",
  entry: "Entry",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  staff: "Staff",
  principal: "Principal",
  manager: "Manager",
  director: "Director",
  vp: "VP",
  executive: "Executive",
};

export const WORK_MODEL_LABELS: Record<WorkModel, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interview_invited: "Interview invited",
  interviewed: "Interview done",
  final_interview: "Final round",
  hired: "Hired 🎉",
  rejected: "Not selected",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: "bg-elevated text-muted",
  reviewed: "bg-brand-soft text-brand",
  shortlisted: "bg-amber/12 text-amber",
  interview_invited: "bg-amber/12 text-amber",
  interviewed: "bg-brand-soft text-brand",
  final_interview: "bg-amber/20 text-amber",
  hired: "bg-green/12 text-green",
  rejected: "bg-coral/12 text-coral",
};
