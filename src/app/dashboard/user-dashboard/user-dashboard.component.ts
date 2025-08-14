import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../header/header.component';


import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LeftMenuComponent } from '../../left-menu/left-menu.component';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    MatInputModule,
    HeaderComponent
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
  Message = '';
  isSuccessMessage: boolean = false;

  searchText: string = '';
  private searchSubject = new Subject<string>();

  newTask = {
    id: 0,
    name: '',
    description: '',
    Duedate: '',
    type: 'general',
    status: 'new',
    priority:''
  };

  tasks: any[] = [];
  statuses: string[] = [];
  priorities: string[] = [];
  types: string[] = [];
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';
  

  completedCount: number = 0;
  pendingCount: number = 0;
  newCount: number = 0;
  totalCount: number = 0;

  constructor(
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.extractUsernameFromToken();
    this.getTasks();
    this.getStatuses();
    this.getPriority();
    this.getTypes();
    this.setupSearchListener();

    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    this.currentDate = now.toLocaleDateString('en-US', options);

    const hour = now.getHours();
    this.greetingTime = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  }

  ngOnInit(): void {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  setupSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(900),
      distinctUntilChanged()
    ).subscribe((query: string) => this.fetchSearchedTasks(query));
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  clearSearch(): void {
    this.searchText = '';
    this.getTasks(); // Reset to full list
  }

  fetchSearchedTasks(query: string): void {
    const userId = this.extractUserIdFromToken();
    if (!userId) return;
  
    const trimmedQuery = query.trim();
  
    if (!trimmedQuery) {
      this.getTasks(); // If search box is empty, fetch all tasks
      return;
    }
  
    this.taskService.searchTasks(userId.toString(), trimmedQuery).subscribe({
      next: (res: any) => {
        const taskList = res.data;
        this.tasks = taskList;
      },
      error: (err: any) => console.error('Search error:', err)
    });
  }
  
  
  extractUsernameFromToken(): void {
    const token = sessionStorage.getItem('authToken');
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
    this.taskService.getStatuses().subscribe({
      next: (res: any) => this.statuses = res.data,
      error: (err: any) => console.error('Error fetching statuses:', err)
    });
  }
  
  getPriority(): void {
    this.taskService.getPriority().subscribe({
      next: (res: any) => this.priorities = res.data,
      error: (err: any) => console.error('Error fetching priority:', err)
    });
  }
  
  getTypes(): void {
    this.taskService.getTypes().subscribe({
      next: (res: any) => this.types = res.data,
      error: (err: any) => console.error('Error fetching types:', err)
    });
  }
  
  getTasks(): void {
    const userId = this.extractUserIdFromToken();
    if (!userId) {
      console.error('User ID not found in token');
      return;
    }
  
    this.taskService.getTasks(userId.toString()).subscribe({
      next: (res: any) => {
        const taskList = res.data;
        this.tasks = taskList;
        this.totalCount = taskList.length;
        this.completedCount = taskList.filter((task: { status: string; }) => task.status.toLowerCase() === 'completed').length;
        this.pendingCount = taskList.filter((task: { status: string; }) => task.status.toLowerCase() === 'in progress').length;
        this.newCount = taskList.filter((task: { status: string; }) => task.status.toLowerCase() === 'new').length;
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }
  
  onView(task: any): void {
    this.newTask = { ...task };
    this.isViewMode = true;
    this.isEditMode = false;
    this.showTaskForm = true;
  }

  onEdit(task: any): void {
    this.newTask = { ...task };
    this.isEditMode = true;
    this.showTaskForm = true;
    this.isViewMode = false;
  }

  onDelete(task: any): void {
    const confirmed = confirm(`Are you sure you want to delete the task "${task.name}"?`);
    if (confirmed) {
      this.taskService.onDelete(task).subscribe({
        next: () => {
          this.Message = "deleted successfully";
          this.isSuccessMessage = true;
          this.getTasks();
          setTimeout(() => this.Message = '', 5000);
        },
        error: (err: any) => {
          console.error('Error deleting task:', err);
          this.Message = "deletion failed";
          this.isSuccessMessage = false;
          setTimeout(() => this.Message = '', 5000);
        }
      });
    }
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  
    this.tasks.sort((a, b) => {
      const valueA = a[column]?.toString().toLowerCase() || '';
      const valueB = b[column]?.toString().toLowerCase() || '';
  
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  saveEditedTask(): void {
    this.taskService.saveEditedTask(this.newTask).subscribe({
      next: () => {
        this.Message = "updated successfully";
        this.isSuccessMessage = true;
        this.resetForm();
        this.getTasks();
        setTimeout(() => this.Message = '', 5000);
      },
      error: (err: any) => {
        this.Message = "update failed";
        this.isSuccessMessage = false;
        setTimeout(() => this.Message = '', 5000);
      }
    });
  }

  createTask(): void {
    if (!this.newTask.name.trim()) {
      alert('Task name is required');
      return;
    }

    const userId = this.extractUserIdFromToken();
    if (!userId) return;

    this.taskService.createTask(userId.toString(), this.newTask).subscribe({
      next: () => {
        this.Message = "task created successfully";
        this.isSuccessMessage = true;
        this.resetForm();
        this.getTasks();
        setTimeout(() => this.Message = '', 5000);
      },
      error: (err: any) => {
        console.error('Error creating task:', err);
        this.Message = "task creation failed";
        this.isSuccessMessage = false;
        setTimeout(() => this.Message = '', 5000);
      }
    });
  }

  resetForm(): void {
    this.newTask = { id: 0, name: '', description: '', Duedate: '', type: 'general', priority: '', status: 'new' };
    this.isEditMode = false;
    this.showTaskForm = false;
    this.isViewMode = false;
  }

  toggleTaskForm(): void {
    this.resetForm();
    this.showTaskForm = true;
    this.isEditMode = false;
  }

  onLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
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
