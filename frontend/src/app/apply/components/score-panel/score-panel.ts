import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideAlertTriangle,
  lucideXCircle,
  lucideThumbsUp,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import type { MatchAnalysis } from '../../application.model';

@Component({
  selector: 'app-score-panel',
  standalone: true,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideCheckCircle,
      lucideAlertTriangle,
      lucideXCircle,
      lucideThumbsUp,
      lucideAlertCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './score-panel.html',
})
export class ScorePanel {
  data = input.required<MatchAnalysis>();

  protected readonly radius = 37;
  protected readonly circumference = 2 * Math.PI * this.radius;

  protected overall = computed(() => {
    const score = this.data().score_breakdown?.overall ?? 0;
    return Math.min(100, Math.max(0, Math.round(score)));
  });

  protected dashOffset = computed(() => this.circumference * (1 - this.overall() / 100));

  protected ringColor = computed(() => {
    const val = this.overall();
    if (val >= 75) return 'stroke-success';
    if (val >= 50) return 'stroke-warning';
    return 'stroke-accent';
  });

  protected breakdown = computed(() => {
    const b = this.data().score_breakdown;
    return [
      { label: 'Skills', value: Math.min(100, Math.max(0, b?.skills ?? 0)) },
      { label: 'Experience', value: Math.min(100, Math.max(0, b?.experience ?? 0)) },
      { label: 'Education', value: Math.min(100, Math.max(0, b?.education ?? 0)) },
      { label: 'Role alignment', value: Math.min(100, Math.max(0, b?.role_alignment ?? 0)) },
    ];
  });

  protected recommendationText = computed(() => {
    return this.data().recommendation?.replaceAll('_', ' ') ?? '';
  });

  protected recommendationClass = computed(() => {
    const rec = this.data().recommendation?.toLowerCase();
    if (rec === 'strong_fit') return 'bg-success/15 border-success/30 text-success';
    if (rec === 'potential_fit') return 'bg-warning/15 border-warning/30 text-warning';
    return 'bg-accent/15 border-accent/30 text-accent';
  });

  protected isMatch(status?: string): boolean {
    const s = status?.toLowerCase();
    return s === 'strong_match' || s === 'match';
  }

  protected isPartial(status?: string): boolean {
    return status?.toLowerCase() === 'partial_match';
  }

  protected isMissing(status?: string): boolean {
    return status?.toLowerCase() === 'missing';
  }

  protected statusPillClass(status?: string): string {
    if (this.isMatch(status)) {
      return 'bg-success/15 border border-success/30 text-success';
    }
    if (this.isPartial(status)) {
      return 'bg-warning/15 border border-warning/30 text-warning';
    }
    return 'bg-accent/15 border border-accent/30 text-accent';
  }
}
