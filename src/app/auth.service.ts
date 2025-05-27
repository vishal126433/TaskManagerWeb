import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    getRole(): string | null {
        return sessionStorage.getItem('userRole');
      }
      
  private refreshTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  refreshToken(): Observable<string> {
    return this.http.post<any>('https://localhost:7027/Auth/refresh-token', {}, { withCredentials: true }).pipe(
      map((res: { accessToken: string }) => {
        if (!res.accessToken) throw new Error('No access token received');

        if (this.isBrowser()) {
          sessionStorage.setItem('authToken', res.accessToken);
          this.scheduleRefresh(res.accessToken);
        }
        return res.accessToken;
      }),
      catchError((err: any) => {
        console.error('Token refresh failed:', err);
        this.logout().subscribe(); // Ensure user is redirected to login
        return of('');
      })
    );
  }

  scheduleRefresh(_token: string): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);

    this.refreshTimer = setInterval(() => {
      this.refreshToken().subscribe();
    }, 60000); // Refresh every 1 minute
  }

  initializeRefreshIfLoggedIn(): void {
    if (this.isBrowser()) {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        this.scheduleRefresh(token);
      }
    }
  }

  logout(): Observable<any> {
    if (this.isBrowser()) {
      sessionStorage.removeItem('authToken');
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
    }

    this.router.navigate(['/']);
    return this.http.post('https://localhost:7129/Users/logout', {}, { withCredentials: true });
  }
}
