import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';

type StageKey = 'match' | 'generate' | 'lint' | 'improve';

@Component({
  selector: 'app-stage-tracker',
  standalone: true,
  imports: [HlmSpinnerImports, NgIcon],
  providers: [provideIcons({ lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stage-tracker.html',
})
export class StageTracker {
  completed = input.required<Set<StageKey>>();
  active = input<StageKey | null>(null);

  protected readonly stages: { key: StageKey; label: string }[] = [
    { key: 'match', label: 'Match' },
    { key: 'generate', label: 'Draft' },
    { key: 'lint', label: 'Lint' },
    { key: 'improve', label: 'Refine' },
  ];

  protected isDone(key: StageKey) {
    return this.completed()?.has(key) ?? false;
  }
  protected isActive(key: StageKey) {
    return this.active() === key;
  }

  protected dotClass(key: StageKey) {
    if (this.isDone(key)) {
      return 'bg-success border-success text-bg shadow-sm shadow-success/20';
    }
    if (this.isActive(key)) {
      return 'bg-surface-raised border-accent text-accent animate-pulse ring-2 ring-accent/30';
    }
    return 'bg-surface-raised border-border text-ink-faint';
  }

  protected lineClass(key: StageKey) {
    return this.isDone(key) ? 'bg-border-strong' : 'bg-border';
  }
}
