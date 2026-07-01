import { AudioWaveform, ScanFace, Eye, MessagesSquare } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SignalReadout } from "@/components/landing/signal-readout";

const READS = [
  { icon: MessagesSquare, label: "Answer", desc: "Scored for reasoning and technical depth." },
  { icon: AudioWaveform, label: "Voice tone", desc: "Emotion and confidence read from audio." },
  { icon: ScanFace, label: "Expression", desc: "Engagement gauged from webcam frames." },
  { icon: Eye, label: "Eye tracking", desc: "Attention and composure tracked in real time." },
];

export function InterviewShowcase() {
  return (
    <Section className="border-y border-line bg-bg-2">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Virtual interview"
              title="A 3D avatar interview that reads the signal"
              lead="Candidates practice with a lifelike AI interviewer; companies get an automated first screen. Every answer is measured across four live signals — not just a résumé."
            />
            <ul className="mt-8 space-y-4">
              {READS.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-0.5 text-sm text-muted">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Reveal>
            <SignalReadout />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
