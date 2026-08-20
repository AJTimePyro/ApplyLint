import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-carousel-nav',
  standalone: true,
  imports: [HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carousel-nav.html',
})
export class CarouselNav {
  index = input.required<number>();
  total = input.required<number>();
  labels = input.required<string[]>();

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() select = new EventEmitter<number>();

  protected label() {
    return `${this.index() + 1} / ${this.total()} — ${this.labels()[this.index()]}`;
  }
}
