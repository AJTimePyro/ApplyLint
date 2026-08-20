import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import type { MatchAnalysis } from '../../application.model';

@Component({
  selector: 'app-score-panel',
  standalone: true,
  imports: [HlmCardImports, HlmBadgeImports, HlmProgressImports, HlmSeparatorImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './score-panel.html',
})
export class ScorePanel {
  data = input.required<MatchAnalysis>();

  private readonly radius = 34;
  protected readonly circumference = 2 * Math.PI * this.radius;

  protected overall = computed(() => this.data().score_breakdown.overall);
  protected dashOffset = computed(() => this.circumference * (1 - this.overall() / 100));

  protected breakdown = computed(() => {
    const b = this.data().score_breakdown;
    return [
      { label: 'Skills', value: b.skills },
      { label: 'Experience', value: b.experience },
      { label: 'Education', value: b.education },
      { label: 'Role alignment', value: b.role_alignment },
    ];
  });

  protected recommendationVariant() {
    return this.data().recommendation === 'strong_fit' ? 'secondary' : 'outline';
  }

  protected statusVariant(status: string) {
    if (status === 'missing') return 'destructive';
    if (status === 'strong_match' || status === 'match') return 'secondary';
    return 'outline';
  }

  protected statusClass(status: string) {
    if (status === 'strong_match' || status === 'match')
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'partial_match') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return '';
  }
}
