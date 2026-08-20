import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import type { CoverLetter } from '../../application.model';

@Component({
  selector: 'app-letter-card',
  standalone: true,
  imports: [HlmCardImports, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './letter-card.html',
})
export class LetterCard {
  data = input.required<CoverLetter>();
  eyebrow = input<string>('Cover letter');

  protected copied = signal(false);

  protected async copy() {
    await navigator.clipboard.writeText(`${this.data().subject}\n\n${this.data().body}`);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
