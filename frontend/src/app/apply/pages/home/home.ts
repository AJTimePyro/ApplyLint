import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSparkles } from '@ng-icons/lucide';
import { ApplyService } from '../../services/apply.service';
import { StageTracker } from '../../components/stage-tracker/stage-tracker';
import { ScorePanel } from '../../components/score-panel/score-panel';
import { LintPanel } from '../../components/lint-panel/lint-panel';
import { LetterCard } from '../../components/letter-card/letter-card';
import { CarouselNav } from '../../components/carousel-nav/carousel-nav';
import type { MatchAnalysis, CoverLetter, RecruiterLint } from '../../application.model';

type PanelType = 'match' | 'cover' | 'lint' | 'improved';
interface Panel {
  type: PanelType;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    HlmSpinnerImports,
    NgIcon,
    StageTracker,
    ScorePanel,
    LintPanel,
    LetterCard,
    CarouselNav,
  ],
  providers: [provideIcons({ lucideSparkles })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  private readonly applyService = inject(ApplyService);
  private readonly cdr = inject(ChangeDetectorRef);

  jobDescription = '';
  applicationId: string | null = null;
  isRunning = false;

  matchAnalysis = signal<MatchAnalysis | null>(null);
  coverLetter = signal<CoverLetter | null>(null);
  recruiterLint = signal<RecruiterLint | null>(null);
  improvedCoverLetter = signal<CoverLetter | null>(null);

  activeStage = signal<'match' | 'generate' | 'lint' | 'improve' | null>(null);
  completedStages = signal(new Set<'match' | 'generate' | 'lint' | 'improve'>());

  currentIndex = signal(0);

  panels = computed<Panel[]>(() => {
    const p: Panel[] = [];
    if (this.matchAnalysis()) p.push({ type: 'match', label: 'Match Analysis' });
    if (this.coverLetter()) p.push({ type: 'cover', label: 'Cover Letter' });
    if (this.recruiterLint()) p.push({ type: 'lint', label: 'Recruiter Lint' });
    if (this.improvedCoverLetter()) p.push({ type: 'improved', label: 'Improved Application' });
    return p;
  });

  panelLabels = computed(() => this.panels().map((p) => p.label));
  currentPanel = computed(() => this.panels()[this.currentIndex()] ?? null);

  goPrev() {
    this.currentIndex.update((i) => Math.max(0, i - 1));
    this.cdr.markForCheck();
  }
  goNext() {
    this.currentIndex.update((i) => Math.min(this.panels().length - 1, i + 1));
    this.cdr.markForCheck();
  }
  goTo(i: number) {
    this.currentIndex.set(i);
    this.cdr.markForCheck();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (this.panels().length < 2) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)
    ) {
      return;
    }
    if (e.key === 'ArrowLeft') this.goPrev();
    if (e.key === 'ArrowRight') this.goNext();
  }

  onClick() {
    if (!this.jobDescription.trim() || this.isRunning) return;

    this.isRunning = true;
    this.matchAnalysis.set(null);
    this.coverLetter.set(null);
    this.recruiterLint.set(null);
    this.improvedCoverLetter.set(null);
    this.completedStages.set(new Set());
    this.currentIndex.set(0);
    this.activeStage.set('match');

    this.applyService.createApplication(this.jobDescription).subscribe({
      next: ({ application_id }) => {
        this.applicationId = application_id;
        this.startWorkflow(application_id);
      },
      error: (error) => {
        console.error('Failed to create application:', error);
        this.isRunning = false;
        this.cdr.markForCheck();
      },
    });
  }

  private startWorkflow(applicationId: string) {
    const eventSource = this.applyService.streamApplication(applicationId);

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);

      switch (update.stage) {
        case 'match':
          this.matchAnalysis.set(update.data.match_analysis);
          this.markDone('match');
          this.activeStage.set('generate');
          break;
        case 'generate':
          this.coverLetter.set(update.data.cover_letter);
          this.markDone('generate');
          this.activeStage.set('lint');
          break;
        case 'recruiter_lint':
          this.recruiterLint.set(update.data.recruiter_lint);
          this.markDone('lint');
          this.activeStage.set('improve');
          break;
        case 'improve':
          this.improvedCoverLetter.set(update.data.cover_letter);
          this.markDone('improve');
          this.activeStage.set(null);
          break;
        case 'completed':
          eventSource.close();
          this.isRunning = false;
          break;
      }
      // jump to the newest panel as it arrives during generation
      if (update.stage !== 'completed') {
        this.currentIndex.set(Math.max(0, this.panels().length - 1));
      }
      this.cdr.markForCheck();
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      this.isRunning = false;
      this.cdr.markForCheck();
    };
  }

  private markDone(stage: 'match' | 'generate' | 'lint' | 'improve') {
    this.completedStages.update((set) => new Set(set).add(stage));
  }
}
