import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideCheck } from '@ng-icons/lucide';
import type { CoverLetter } from '../../application.model';

@Component({
  selector: 'app-letter-card',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideCopy, lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './letter-card.html',
})
export class LetterCard {
  data = input.required<CoverLetter>();
  eyebrow = input<string>('Cover letter');

  protected copied = signal(false);
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  protected async copy() {
    const text = `${this.data().subject ?? ''}\n\n${this.data().body ?? ''}`.trim();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        this.fallbackCopy(text);
      }
      this.triggerCopied();
    } catch {
      this.fallbackCopy(text);
      this.triggerCopied();
    }
  }

  private fallbackCopy(text: string) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (err) {
      console.warn('Clipboard copy fallback failed:', err);
    }
  }

  private triggerCopied() {
    this.copied.set(true);
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    this.copyTimeout = setTimeout(() => this.copied.set(false), 1500);
  }
}
