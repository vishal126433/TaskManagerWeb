import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
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

  getTasks(userId: string): Observable<any[]> {
    const url = `${this.baseUrl}/Tasks/${userId}`;
    return this.http.get<any[]>(url);
  }
  getTasksss(pageNumber: number, pageSize: number) {
    const url = `${this.baseUrl}/Tasks?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<{
      totalCount: number;
      tasks: any[];
      completedCount: number;
      pendingCount: number;
      newCount: number;
    }>(url);
  }
  
  
  getTaskss(): Observable<any[]> {
    const url = `${this.baseUrl}/Users`;
    return this.http.get<any[]>(url);
  }
  getStatuses(): Observable<string[]> {
    const url = `${this.baseUrl}/Tasks/statuslist`;
    return this.http.get<string[]>(url);
  }
  getPriority(): Observable<string[]> {
    const url = `${this.baseUrl}/Tasks/prioritylist`;
    return this.http.get<string[]>(url);
  }
  getTypes(): Observable<string[]> {
    const url = `${this.baseUrl}/Tasks/typelist`;
    return this.http.get<string[]>(url);
  }
  searchTasks(userId: string, query: string) {
    const url = `${this.baseUrl}/Tasks/search?userId=${userId}&query=${encodeURIComponent(query)}`;
    return this.http.get<any[]>(url);
  }
  searchTaskss(query: string) {
    const url = `${this.baseUrl}/Tasks/searchTasks?query=${encodeURIComponent(query)}`;
    return this.http.get<any[]>(url);
  }
  
  
  
  

  createTask(userId: string, newTask: any): Observable<any[]> {
    const url = `${this.baseUrl}/Tasks/create/${userId}`;
    return this.http.post<any[]>(url, newTask);
  }

  saveEditedTask(newTask: any): Observable<any[]> {
    const url = `${this.baseUrl}/Tasks/${newTask.id}`;
    return this.http.put<any[]>(url, newTask);
  }

  onDelete(task: any): Observable<any[]> {
    const url = `${this.baseUrl}/Tasks/${task.id}`;
    return this.http.delete<any[]>(url);
  }

  refreshToken(): Observable<string> {
    return this.http.post<any>(`${this.baseUrl}/Users/refresh-token`, {}, { withCredentials: true }).pipe(
      map((res: any) => {
        const accessToken = res?.data?.accessToken;
        
        if (!accessToken || accessToken === '') {
          console.error('Access token missing or empty in response:', res);
          throw new Error('No access token received');
        }  
        if (this.isBrowser()) {
          sessionStorage.setItem('authToken', accessToken);
          this.scheduleRefresh(accessToken);
        }
        return accessToken;
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
    return this.http.post(`${this.baseUrl}/Auth/logout`, {}, { withCredentials: true });
  }
}
