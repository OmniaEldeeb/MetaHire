"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, ArrowLeft, Mail, Phone, MapPin, Linkedin, Github, Globe,
  CheckCircle2, XCircle, Target, Lightbulb, TrendingUp, GraduationCap,
  Sparkles, AlertTriangle, Briefcase,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/section";
import { imgUrl } from "@/lib/utils";
import { companyJobsApi, type CompanyApplication } from "@/lib/api/endpoints/company-jobs";
import { useAuthStore } from "@/stores/auth.store";
import { useCompanyAccess } from "@/lib/hooks/use-company-access";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/lib/constants/labels";
import type { ApplicationStatus } from "@/lib/constants/enums";
import { InterviewReport } from "@/components/interview/interview-report";

const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

/** A titled list of bullet points with an icon. */
function ListCard({
  title, items, icon: Icon, tone = "muted",
}: {
  title: string;
  items?: string[];
  icon: React.ComponentType<{ className?: string }>;
  tone?: "brand" | "green" | "coral" | "amber" | "muted";
}) {
  if (!items?.length) return null;
  const toneCls =
    tone === "green" ? "text-green" : tone === "coral" ? "text-coral"
    : tone === "amber" ? "text-amber" : tone === "brand" ? "text-brand" : "text-faint";
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight">
        <Icon className={`h-4 w-4 ${toneCls}`} /> {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneCls.replace("text-", "bg-")}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chips({ items, tone }: { items?: string[]; tone: "green" | "coral" }) {
  if (!items?.length) return null;
  const cls = tone === "green" ? "bg-green/12 text-green" : "bg-coral/12 text-coral";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{s}</span>
      ))}
    </div>
  );
}

function ScoreStat({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-center">
      <p className="text-2xl font-extrabold tracking-tight">
        {value ?? "—"}{value !== null ? suffix : ""}
      </p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

export default function CompanyApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const status = useAuthStore((s) => s.status);
  const { isCompanyUser } = useCompanyAccess();

  useEffect(() => {
    if (status === "authenticated" && !isCompanyUser) router.replace("/dashboard");
  }, [status, isCompanyUser, router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company-application", id],
    queryFn: () => companyJobsApi.getApplication(id, true),
    enabled: isCompanyUser && Number.isFinite(id),
  });

  const app: CompanyApplication | undefined = data
    ? ("id" in (data as object) ? (data as CompanyApplication) : (data as { application?: CompanyApplication }).application)
    : undefined;

  if (!isCompanyUser || isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
  }
  if (isError || !app) {
    return <Container className="py-16 text-center text-sm text-muted">Couldn&apos;t load this application.</Container>;
  }

  const c = app.candidate;
  const a = app.cv_analysis_summary;
  const iv = app.interview;
  const avatar = imgUrl(c?.profile_image_url) ?? "";
  const statusKey = app.status as ApplicationStatus | undefined;

  return (
    <Container className="max-w-3xl py-8">
      <button onClick={() => router.back()} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Candidate header */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-soft text-xl font-bold text-brand">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (c?.name?.charAt(0) ?? "?")}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-extrabold tracking-tight">{c?.name}</h1>
              {statusKey && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${APPLICATION_STATUS_COLORS[statusKey] ?? "bg-elevated text-muted"}`}>
                  {APPLICATION_STATUS_LABELS[statusKey] ?? app.status}
                </span>
              )}
              {c?.open_to_work && <span className="rounded-full bg-green/12 px-2.5 py-0.5 text-xs font-semibold text-green">Open to work</span>}
            </div>
            {c?.headline && <p className="mt-1 text-sm text-muted">{c.headline}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
              {c?.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-faint" />{c.email}</span>}
              {c?.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-faint" />{c.phone}</span>}
              {c?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-faint" />{c.location}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {c?.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand hover:underline"><Linkedin className="h-3.5 w-3.5" />LinkedIn</a>}
              {c?.github_url && <a href={c.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand hover:underline"><Github className="h-3.5 w-3.5" />GitHub</a>}
              {c?.portfolio_url && <a href={c.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand hover:underline"><Globe className="h-3.5 w-3.5" />Portfolio</a>}
            </div>
          </div>
        </div>
        {app.job?.title && (
          <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-4 text-sm text-muted">
            <Briefcase className="h-4 w-4 text-faint" /> Applied for <span className="font-semibold text-ink">{app.job.title}</span>
          </p>
        )}
      </div>

      {/* Scores */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreStat label="CV score" value={num(app.cv_score ?? a?.score)} suffix="%" />
        <ScoreStat label="Final score" value={num(app.final_score ?? iv?.final_score)} suffix="%" />
        <ScoreStat label="Technical" value={num(iv?.technical_score)} suffix="%" />
        <ScoreStat label="Communication" value={num(iv?.communication_score)} suffix="%" />
      </div>

      {/* CV analysis */}
      {a && (
        <section className="mt-6 space-y-4">
          <h2 className="font-display text-lg font-bold tracking-tight">CV analysis</h2>

          {(a.hire_recommendation || a.hire_decision_hint || a.job_fit_level) && (
            <div className="flex flex-wrap gap-2">
              {(a.hire_recommendation || a.hire_decision_hint) && (
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold capitalize text-brand">
                  Recommendation: {a.hire_recommendation ?? a.hire_decision_hint}
                </span>
              )}
              {a.job_fit_level && (
                <span className="rounded-full bg-elevated px-3 py-1 text-xs font-semibold capitalize text-muted">
                  Job fit: {a.job_fit_level}
                </span>
              )}
            </div>
          )}

          {(a.summary || a.fit_summary) && (
            <div className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-muted">
              {a.summary && <p>{a.summary}</p>}
              {a.fit_summary && <p className={a.summary ? "mt-3" : ""}>{a.fit_summary}</p>}
            </div>
          )}

          {a.score_breakdown && Object.keys(a.score_breakdown).length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="mb-3 font-display text-sm font-bold tracking-tight">Score breakdown</h3>
              <div className="space-y-2.5">
                {Object.entries(a.score_breakdown).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs">
                      <span className="capitalize text-muted">{k.replace(/_/g, " ")}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Number(v) * 4)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(a.matched_skills?.length || a.missing_skills?.length) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {a.matched_skills?.length ? (
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-green" />Matched skills</h3>
                  <Chips items={a.matched_skills} tone="green" />
                </div>
              ) : null}
              {a.missing_skills?.length ? (
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold"><XCircle className="h-4 w-4 text-coral" />Missing skills</h3>
                  <Chips items={a.missing_skills} tone="coral" />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ListCard title="Strengths" items={a.strengths} icon={CheckCircle2} tone="green" />
            <ListCard title="Weaknesses" items={a.weaknesses} icon={AlertTriangle} tone="coral" />
            <ListCard title="Strengths for this job" items={a.strengths_for_job} icon={Sparkles} tone="brand" />
            <ListCard title="Critical gaps" items={a.critical_gaps} icon={XCircle} tone="coral" />
            <ListCard title="Interview focus areas" items={a.interview_focus_areas} icon={Target} tone="amber" />
            <ListCard title="Skill gaps" items={a.skill_gaps} icon={GraduationCap} tone="amber" />
            <ListCard title="CV improvements" items={a.cv_improvements} icon={Lightbulb} tone="muted" />
            <ListCard title="Career advice" items={a.career_advice} icon={TrendingUp} tone="brand" />
          </div>
        </section>
      )}

      {/* AI interview report */}
      {iv?.id && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold tracking-tight">AI interview report</h2>
          {iv.ai_feedback && (
            <div className="mb-4 rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-muted">{iv.ai_feedback}</div>
          )}
          <InterviewReport interviewId={iv.id} />
        </section>
      )}
    </Container>
  );
}
