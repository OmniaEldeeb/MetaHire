import { api } from "../client";
import type { Paginated } from "../types";
import type { WorkType, WorkModel, ExperienceLevel, ApplicationStatus } from "@/lib/constants/enums";
import type { Job } from "./jobs";

export interface DashboardStats {
  total_jobs?: number;
  active_jobs?: number;
  total_applications?: number;
  pending_review?: number;         // controller field name
  pending_applications?: number;    // alias for backwards compat
  interviews_pending?: number;
  interviews_completed?: number;
  hired?: number;
  [key: string]: unknown;
}

export interface CreateJobBody {
  title: string;
  description: string;
  work_type: WorkType;
  work_model: WorkModel;
  experience_level: ExperienceLevel;
  target_role?: string;
  requirements?: string[];
  skills?: string[];
  location?: string;
  salary_range?: string;
  category_id?: number;
  expires_at?: string;
  auto_invite_enabled?: boolean;
  auto_ai_invite_count?: number;
  auto_final_invite_count?: number;
  min_cv_score?: number;
  min_ai_score?: number;
  focus_criteria?: string[];
}

export interface CompanyApplication {
  id: number;
  status?: ApplicationStatus;
  cover_letter?: string;
  created_at?: string;
  updated_at?: string;
  cv_id?: number;
  cv_score?: number;
  final_score?: number;       // ApplicationResource field (not ai_score)
  interview_invited?: boolean;
  interview_invited_at?: string | null;
  final_interview_invited?: boolean;
  final_interview_invited_at?: string | null;
  company_notes?: string | null;
  // UserResource returns candidate profile fields flat (not nested under candidate_profile)
  candidate?: {
    id: number;
    name: string;
    email?: string;
    role?: string;
    phone?: string | null;
    bio?: string | null;
    headline?: string;          // flat on UserResource
    location?: string;          // flat on UserResource
    profile_image_url?: string | null;  // flat on UserResource
    skills?: string[];          // flat on UserResource
    open_to_work?: boolean;
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    // kept for backwards compat with any code still using nested form
    candidate_profile?: {
      headline?: string;
      location?: string;
      profile_image_url?: string | null;
      skills?: string[];
    };
  };
  job?: Job;
  cv?: {
    id?: number;
    original_filename?: string | null;
    cv_url?: string | null;
    analysis_status?: string;
    score_label?: string | null;
  } | null;
  interview?: {
    id: number;
    type?: string;
    status?: string;
    target_role?: string;
    level?: string;
    language?: string;
    total_questions?: number;
    s_tone?: number | null;
    s_face?: number | null;
    communication_score?: number | null;
    technical_score?: number | null;
    final_score?: number | null;
    ai_feedback?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
  } | null;
  cv_analysis_summary?: {
    score?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    score_breakdown?: Record<string, number>;
    hire_decision_hint?: string;
    job_fit_level?: string;
    fit_summary?: string;
    strengths_for_job?: string[];
    critical_gaps?: string[];
    interview_focus_areas?: string[];
    hire_recommendation?: string;
    cv_improvements?: string[];
    skill_gaps?: string[];
    career_advice?: string[];
  };
}

export interface ApplicationStats {
  pending?: number;
  reviewed?: number;
  shortlisted?: number;
  interview_invited?: number;
  interviewed?: number;
  final_interview?: number;
  hired?: number;
  rejected?: number;
  [key: string]: unknown;
}

export interface ScheduleFinalBody {
  window_start: string;
  window_end: string;
  scheduled_at?: string;
  duration_minutes?: number;
  format?: "in_person" | "online" | "phone";
  location?: string;
  meeting_link?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  dress_code?: string;
  notes?: string;
  interview_format_detail?: string;
  rounds?: number;
}

function list<T>(res: Paginated<T> | T[]): T[] {
  if (Array.isArray(res)) return res;
  return (res as Paginated<T>).data ?? [];
}

function paged<T>(res: Paginated<T> | T[]): { items: T[]; page: number; lastPage: number; total: number } {
  if (Array.isArray(res)) return { items: res, page: 1, lastPage: 1, total: res.length };
  const r = res as Paginated<T>;
  return { items: r.data ?? [], page: r.current_page ?? 1, lastPage: r.last_page ?? 1, total: r.total ?? r.data?.length ?? 0 };
}

export const companyJobsApi = {
  dashboard: () => api.get<{ data?: DashboardStats } | DashboardStats>("/company/dashboard"),

  listJobs: () => api.get<Paginated<Job> | Job[]>("/company/jobs").then(list<Job>),
  getJob: (id: number) => api.get<{ job?: Job; stats?: Record<string, number> } | Job>(`/company/jobs/${id}`),
  createJob: (body: CreateJobBody) => api.post<Job>("/company/jobs", body),
  updateJob: (id: number, body: Partial<CreateJobBody>) =>
    api.put<Job>(`/company/jobs/${id}`, body),
  deleteJob: (id: number) => api.delete<unknown>(`/company/jobs/${id}`),
  toggleJob: (id: number) => api.patch<{ is_active: boolean }>(`/company/jobs/${id}/toggle`),

  applications: (
    jobId: number,
    params?: { page?: number; status?: ApplicationStatus; sort?: string; per_page?: number },
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.status) q.set("status", params.status);
    if (params?.sort) q.set("sort", params.sort);
    if (params?.per_page) q.set("per_page", String(params.per_page));
    const qs = q.toString();
    return api.get<Paginated<CompanyApplication> | CompanyApplication[]>(
      `/company/jobs/${jobId}/applications${qs ? `?${qs}` : ""}`,
    ).then((r) => paged<CompanyApplication>(r));
  },

  applicationStats: (jobId: number) =>
    api.get<{ data?: ApplicationStats } | ApplicationStats>(
      `/company/jobs/${jobId}/applications/stats`,
    ),

  getApplication: (id: number, full = false) =>
    api.get<{ application?: CompanyApplication } | CompanyApplication>(
      `/company/applications/${id}${full ? "?full_analysis=true" : ""}`,
    ),

  invite: (appId: number) =>
    api.post<unknown>(`/company/applications/${appId}/invite`),

  inviteFinal: (appId: number) =>
    api.post<unknown>(`/company/applications/${appId}/invite-final`),

  updateStatus: (appId: number, body: { status: ApplicationStatus; notes?: string }) =>
    api.patch<unknown>(`/company/applications/${appId}/status`, body),

  autoInvite: (jobId: number) =>
    api.post<{ count?: number }>(`/company/auto-invite/${jobId}`),

  scheduleFinal: (appId: number, body: ScheduleFinalBody) =>
    api.post<unknown>(`/company/applications/${appId}/schedule-final`, body),

  getFinalSchedule: (appId: number) =>
    api.get<unknown>(`/company/applications/${appId}/final-schedule`),

  // AI chatbot job creation
  chatbot: (body: { message: string; conversation_id: string | null }) =>
    api.post<{
      conversation_id: string;
      response: string;
      job_data: unknown | null;
      ready_to_create: boolean;
    }>("/company/chatbot/job-posting", body),

  confirmChatbotJob: (body: {
    conversation_id: string;
    job_data: unknown;
    auto_invite_enabled?: boolean;
      expires_at?: string;
  }) => api.post<{ data?: { job?: Job } }>("/company/chatbot/confirm-job", body),

  analyzeCandidates: () =>
    api.post<unknown>("/company/chatbot/analyze-candidates"),
};

export { paged };
