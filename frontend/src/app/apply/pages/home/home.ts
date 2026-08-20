import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ApplyService } from '../../services/apply.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [FormsModule, JsonPipe, HlmTextareaImports, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly applyService = inject(ApplyService);
  private readonly cdr = inject(ChangeDetectorRef);

  jobDescription = '';

  applicationId: string | null = null;
  isRunning = false;

  matchAnalysis: any = null;
  coverLetter: any = null;
  recruiterLint: any = null;
  improvedCoverLetter: any = null;

  onClick() {
    if (!this.jobDescription.trim() || this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.applyService.createApplication(this.jobDescription).subscribe({
      next: ({ application_id }) => {
        this.applicationId = application_id;

        console.log('Application created:', application_id);

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

      console.log(update.stage, update.data);

      switch (update.stage) {
        case 'match':
          this.matchAnalysis = update.data.match_analysis;
          break;

        case 'generate':
          this.coverLetter = update.data.cover_letter;
          break;

        case 'recruiter_lint':
          this.recruiterLint = update.data.recruiter_lint;
          break;

        case 'improve':
          this.improvedCoverLetter = update.data.cover_letter;
          break;

        case 'completed':
          eventSource.close();
          this.isRunning = false;
          break;
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
}
