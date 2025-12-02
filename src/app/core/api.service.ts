import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, timeout, retryWhen, scan, mergeMap } from 'rxjs/operators';
import { throwError, of, timer } from 'rxjs';
import { GlobalErrorService } from './global-error.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl || '';

  constructor(private http: HttpClient, private globalError: GlobalErrorService) {}

  private async notifyError(err: any) {
    try {
      await this.globalError.handleError(err);
    } catch (e) {
      console.error('Global error handler failed', e);
    }
  }

  private handleError(err: any) {
    console.error('API Error', err);
    // notifica al usuario (no await en el flujo RX, pero llamamos y no bloqueamos)
    this.notifyError(err);
    return throwError(() => err?.error ?? { message: 'Error de red' });
  }

  get<T>(path: string, params?: HttpParams) {
    return this.http
      .get<T>(`${this.base}/${path}`, { params })
      .pipe(
        timeout(15000),
        // retry up to 3 times with exponential backoff for transient errors
        retryWhen(errors =>
          errors.pipe(
            scan((acc, err) => {
              const attempts = (acc.attempts || 0) + 1;
              if (attempts > 3) {
                throw err;
              }
              return { attempts, err } as any;
            }, { attempts: 0 }),
            mergeMap((s: any) => timer(500 * Math.pow(2, s.attempts - 1)))
          )
        ),
        catchError(err => this.handleError(err))
      );
  }

  post<T, B = any>(path: string, body: B, headers?: HttpHeaders) {
    return this.http
      .post<T>(`${this.base}/${path}`, body, { headers })
      .pipe(timeout(15000), catchError(err => this.handleError(err)));
  }

  put<T, B = any>(path: string, body: B) {
    return this.http
      .put<T>(`${this.base}/${path}`, body)
      .pipe(timeout(15000), catchError(err => this.handleError(err)));
  }

  delete<T>(path: string) {
    return this.http
      .delete<T>(`${this.base}/${path}`)
      .pipe(timeout(15000), catchError(err => this.handleError(err)));
  }
}
