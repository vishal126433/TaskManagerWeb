import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { Observable, catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = environment.apiUrlTask;

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



getUsers(): Observable<any[]> {
    const url = `${this.baseUrl}/Users`;
    return this.http.get<any[]>(url);
  }

  createUser(newUser: any): Observable<any[]> {
    const url = `${this.baseUrl}/Users/create`;
    return this.http.post<any[]>(url, newUser);
  }

  saveEditedUser(newUser: any): Observable<any[]> {
    const url = `${this.baseUrl}/Users/${newUser.id}`;
    return this.http.put<any[]>(url, newUser);
  }

  onDelete(userId: number): Observable<any> {
    const url = `${this.baseUrl}/Users/${userId}`;
    return this.http.delete<any>(url);
  }
  
  deactivateUser(userId: number): Observable<any> {
    const url = `${this.baseUrl}/Users/toggle-active/${userId}`;
    return this.http.post<any>(url, {});
  }
  

 

  logout(): Observable<any> {
    if (this.isBrowser()) {
      sessionStorage.removeItem('authToken');
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
    }

    this.router.navigate(['/']);
    return this.http.post(`${this.baseUrl}/Auth/logout`, {}, { withCredentials: true });
  }
}
