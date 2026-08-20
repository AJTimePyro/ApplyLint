import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

type StageKey = 'match' | 'generate' | 'lint' | 'improve';

@Component({
  selector: 'app-stage-tracker',
  standalone: true,
  imports: [HlmSpinnerImports],
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
    return this.completed().has(key);
  }
  protected isActive(key: StageKey) {
    return this.active() === key;
  }

  protected dotClass(key: StageKey) {
    if (this.isDone(key)) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
    if (this.isActive(key)) return 'bg-zinc-800 border-zinc-600 text-zinc-200';
    return 'bg-zinc-900 border-zinc-800 text-zinc-600';
  }

  protected lineClass(key: StageKey) {
    return this.isDone(key) ? 'bg-emerald-500/40' : 'bg-zinc-800';
  }
}
