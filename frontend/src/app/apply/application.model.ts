export interface RequirementItem {
  requirement: string;
  importance: 'critical' | 'important' | 'nice_to_have' | string;
  status: 'strong_match' | 'partial_match' | 'missing' | string;
  evidence: string[];
}

export interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  role_alignment: number;
  overall: number;
}

export interface MatchAnalysis {
  score_breakdown: ScoreBreakdown;
  requirements: RequirementItem[];
  strengths: { point: string; impact: string; evidence: string[] }[];
  concerns: { concern: string; severity: string }[];
  recommendation: string;
  summary: string;
}

export interface CoverLetter {
  subject: string;
  body: string;
}

export interface LintReason {
  code: string;
  severity: 'critical' | 'medium' | 'low' | string;
  evidence: string;
  explanation: string;
  sources: string[];
}

export interface RecruiterLint {
  decision: 'approve' | 'reject' | string;
  reasons: LintReason[];
  summary: string;
}
