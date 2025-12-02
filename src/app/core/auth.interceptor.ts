import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Attach token if present
    return from(this.auth.getAccessToken()).pipe(
      switchMap((token: any) => {
        const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
        return next.handle(authReq).pipe(
          catchError((err: any) => {
            // If 401, try refresh once
            if (err instanceof HttpErrorResponse && err.status === 401) {
              return from(this.auth.refreshToken()).pipe(
                switchMap((newToken: string | null) => {
                  if (newToken) {
                    const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                    return next.handle(retried);
                  }
                  return throwError(() => err);
                }),
                catchError(() => throwError(() => err))
              );
            }
            return throwError(() => err);
          })
        );
      })
    );
  }
}
