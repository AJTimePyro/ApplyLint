import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../config';

export interface ApplyResponse {
  application_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplyService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${config.apiUrl}/apply`;

  createApplication(jobDescription: string): Observable<ApplyResponse> {
    return this.http.post<ApplyResponse>(this.apiUrl, {
      job_description: jobDescription,
    });
  }

  streamApplication(applicationId: string): EventSource {
    return new EventSource(`${this.apiUrl}/${applicationId}/stream`);
  }
}
