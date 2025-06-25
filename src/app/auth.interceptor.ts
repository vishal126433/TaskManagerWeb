import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isRefreshRequest = req.url.endsWith('/refresh-token');
  const token = sessionStorage.getItem('authToken');

  let authReq = req;

  if (token && !isRefreshRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isRefreshRequest) {
        return authService.refreshToken().pipe(
          switchMap((newToken: string | null) => {
            if (!newToken) return throwError(() => err);
            sessionStorage.setItem('authToken', newToken);
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr: any) => {
            console.error('Refresh token failed:', refreshErr);
            authService.logout().subscribe();
            return throwError(() => err);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
