import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideXCircle } from '@ng-icons/lucide';
import type { RecruiterLint } from '../../application.model';

@Component({
  selector: 'app-lint-panel',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheckCircle, lucideXCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lint-panel.html',
})
export class LintPanel {
  data = input.required<RecruiterLint>();

  protected isAdvance = computed(() => this.data().decision?.toLowerCase() === 'advance');

  protected decisionClass = computed(() => {
    const d = this.data().decision?.toLowerCase();
    if (d === 'advance') return 'bg-success/15 border-success/30 text-success';
    if (d === 'reject') return 'bg-accent/15 border-accent/30 text-accent';
    return 'bg-warning/15 border-warning/30 text-warning';
  });

  protected findingBorderClass(severity?: string): string {
    const s = severity?.toLowerCase() ?? '';
    if (s === 'critical' || s === 'high') return 'border-l-accent';
    if (s === 'medium') return 'border-l-warning';
    return 'border-l-ink-faint';
  }

  protected severityTextClass(severity?: string): string {
    const s = severity?.toLowerCase() ?? '';
    if (s === 'critical' || s === 'high') return 'text-accent';
    if (s === 'medium') return 'text-warning';
    return 'text-ink-muted';
  }
}
