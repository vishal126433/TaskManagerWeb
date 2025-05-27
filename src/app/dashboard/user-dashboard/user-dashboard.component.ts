import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LeftMenuComponent } from '../../left-menu/left-menu.component';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'user-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    CommonModule,
    HttpClientModule,
    LeftMenuComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {
  showLogoutConfirm = false;
  showTaskForm = false;
  isEditMode = false;
  isViewMode = false;
  username: string = '';
  currentDate: string = '';
greetingTime: string = '';
isCollapsed: boolean = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }


  newTask = {
    id: 0,
    name: '',
    description: '',
    status: 'pending'
  };

  tasks: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.extractUsernameFromToken();

    this.getTasks();
    this.getStatuses();
    const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  this.currentDate = now.toLocaleDateString('en-US', options);

  // Determine greeting
  const hour = now.getHours();
  if (hour < 12) this.greetingTime = 'Morning';
  else if (hour < 18) this.greetingTime = 'Afternoon';
  else this.greetingTime = 'Evening';

  }

  statuses: string[] = [];
  extractUsernameFromToken(): void {
    const token = sessionStorage.getItem('authToken'); // or localStorage
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }
  extractUserIdFromToken(): number | null {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        return userId ? parseInt(userId, 10) : null;
      } catch (e) {
        console.error("Failed to decode token", e);
        return null;
      }
    }
    return null;
  }
  

getStatuses(): void {
  this.http.get<string[]>('https://localhost:7129/Tasks/statuslist').subscribe({
    next: (res: string[]) => {
      this.statuses = res;
      console.log('Statuses:', this.statuses);
    },
    error: (err: any) => {
      console.error('Error fetching statuses:', err);
    }
  });
}


completedCount: number = 0;
pendingCount: number = 0;
totalCount: number = 0;

getTasks(): void {
  const userId = this.extractUserIdFromToken(); // Extract from token

  if (!userId) {
    console.error('User ID not found in token');
    return;
  }

  this.http.get<any[]>(`https://localhost:7129/Tasks/${userId}`).subscribe({
    next: (res: any[]) => {
      this.tasks = res;
      this.totalCount = res.length;
      this.completedCount = res.filter(task => task.status.toLowerCase() === 'completed').length;
      this.pendingCount = res.filter(task => task.status.toLowerCase() === 'pending').length;
    },
    error: (err: any) => {
      console.error('Error fetching tasks:', err);
    }
  });
}


  onView(task: any): void {
    this.newTask = { ...task }; // load task to form
    this.isViewMode = true;
    this.isEditMode = false;
    this.showTaskForm = true;
  }

  onEdit(task: any): void {
    this.newTask = { ...task }; // load task to form
    this.isEditMode = true;
    this.showTaskForm = true;
    this.isViewMode = false;

  }

  saveEditedTask(): void {
    this.http.put(`https://localhost:7129/Tasks/${this.newTask.id}`, this.newTask).subscribe({
      next: () => {
        console.log('Task updated successfully');
        this.resetForm();
        this.getTasks();
      },
      error: (err: any) => {
        console.error('Error updating task:', err);
      }
    });
  }

  onDelete(task: any): void {
    const confirmed = confirm(`Are you sure you want to delete the task "${task.name}"?`);
    if (confirmed) {
      this.http.delete(`https://localhost:7129/Tasks/${task.id}`).subscribe({
        next: () => {
          console.log('Task deleted successfully');
          this.getTasks();
        },
        error: (err: any) => {
          console.error('Error deleting task:', err);
        }
      });
    }
  }

  createTask(): void {
    if (!this.newTask.name.trim()) {
      alert('Task name is required');
      return;
    }
  
    const userId = this.extractUserIdFromToken(); // Extract from JWT
  
    if (!userId) {
      console.error('User ID not found in token');
      return;
    }
  
    this.http.post(`https://localhost:7129/Tasks/create/${userId}`, this.newTask).subscribe({
      next: (res: any) => {
        console.log('Task created successfully:', res);
        this.resetForm();
        this.getTasks();
      },
      error: (err: any) => {
        console.error('Error creating task:', err);
      }
    });
  }
  
  resetForm(): void {
    this.newTask = { id: 0, name: '', description: '', status: 'pending' };
    this.isEditMode = false;
    this.showTaskForm = false;
    this.isViewMode = false;

  }

  toggleTaskForm(): void {
    this.resetForm();              // Clear the form first
    this.showTaskForm = true;     // Always show the form
    this.isEditMode = false;      // Ensure we are in create mode
  }
  

  // Logout logic
  onLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Logout failed:', err);
      }
    });
    this.showLogoutConfirm = false;
  }
}
