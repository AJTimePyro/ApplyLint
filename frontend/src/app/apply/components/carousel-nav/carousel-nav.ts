import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-carousel-nav',
  standalone: true,
  imports: [NgIcon],
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
  @Output() selectIndex = new EventEmitter<number>();
  @Output() select = this.selectIndex;

  protected label() {
    const currentLabel = this.labels()[this.index()] ?? '';
    return `${this.index() + 1} / ${this.total()}${currentLabel ? ' — ' + currentLabel : ''}`;
  }
}
