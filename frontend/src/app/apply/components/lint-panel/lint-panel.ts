import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import type { RecruiterLint } from '../../application.model';

@Component({
  selector: 'app-lint-panel',
  standalone: true,
  imports: [HlmCardImports, HlmBadgeImports, HlmSeparatorImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lint-panel.html',
})
export class LintPanel {
  data = input.required<RecruiterLint>();

  protected severityVariant(severity: string) {
    if (severity === 'critical') return 'destructive';
    if (severity === 'medium') return 'outline';
    return 'secondary';
  }

  protected severityClass(severity: string) {
    return severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : '';
  }
}
