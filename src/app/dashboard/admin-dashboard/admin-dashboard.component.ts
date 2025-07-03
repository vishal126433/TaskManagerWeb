import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LeftMenuComponent } from '../../left-menu/left-menu.component';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'admin-dashboard',
  standalone: true,

  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    MatTabsModule,
    HttpClientModule,
    LeftMenuComponent,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule, MatMenuModule, 
  MatInputModule  
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
 
  showLogoutConfirm = false;
  showTaskForm = false;
  isCollapsed: boolean = false;
  searchText: string = '';
  private searchSubject = new Subject<string>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  newTask = {
    name: '',
    description: '',
    status: 'new',
    type:'general',
    Duedate: '',
    username:''

  };
  Message = ''; 
  isSuccessMessage: boolean = false;
  usernames: string[] = [];
  username: string = '';
  currentDate: string = '';
greetingTime: string = '';
users: any[] = [];  
tasks: any[] = [];  
statuses: string[] = [];
types: string[] = [];


completedCount: number = 0;
pendingCount: number = 0;
newCount: number = 0;
totalCount: number = 0;
totalUsers: number = 0;
isEditMode = false;
isViewMode = false;
currentPage: number = 1;
pageSize: number = 5;



  selectedUser: string = '';
  constructor(
    private router: Router,
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.extractUsernameFromToken();
    const now = new Date();
    

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
    this.getTypes();

    this.setupSearchListener();
    // Determine greeting
    const hour = now.getHours();
    if (hour < 12) this.greetingTime = 'Morning';
    else if (hour < 18) this.greetingTime = 'Afternoon';
    else this.greetingTime = 'Evening';
    this.userService.getUsers().subscribe({

    // this.http.get<any[]>('https://localhost:7129/users').subscribe({
      next: (res: any[]) => {
        this.users=res;
        this.usernames = res.map(u => u.username);
        this.totalUsers = this.usernames.length; // Store the count

      },
      error: (err: any) => {
        console.error('Error fetching usernames:', err);
      }
    });

    this.taskService.getTasksss(this.currentPage, this.pageSize).subscribe({

      // this.http.get<any[]>('https://localhost:7129/users').subscribe({
        next: (res: { tasks: any[]; totalCount: number }) => {
          this.tasks = res.tasks;
          this.totalCount = res.totalCount;
          this.completedCount = res.tasks.filter(t => t.status.toLowerCase() === 'completed').length;
          this.pendingCount = res.tasks.filter(t => t.status.toLowerCase() === 'in progress').length;
          this.newCount = res.tasks.filter(t => t.status.toLowerCase() === 'new').length;
        },
        
        error: (err: any) => {
          console.error('Error fetching usernames:', err);
        }
      });


      

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
          this.loadAllTasks();
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
  saveEditedTask(): void {
    this.taskService.saveEditedTask(this.newTask).subscribe({
      next: () => {
        this.Message = "updated successfully";
        this.isSuccessMessage = true;
        this.resetForm();
        this.loadAllTasks();
        setTimeout(() => this.Message = '', 5000);
      },
      error: (err: any) => {
        this.Message = "update failed";
        this.isSuccessMessage = false;
        setTimeout(() => this.Message = '', 5000);
      }
    });
  }

  resetForm(): void {
    this.newTask = {name: '', description: '', status: 'new', type: 'general', Duedate: '',username: '' };

    this.isEditMode = false;
    this.showTaskForm = false;
    this.isViewMode = false;
  }
  clearSearch(): void {
    this.searchText = '';
    this.loadAllTasks(); // Reset to full list
  }
  fetchSearchedTasks(query: string): void {
    const trimmedQuery = query.trim();
  
    if (!trimmedQuery) {
      this.loadAllTasks();  // show full list again
      return;
    }
  
    this.taskService.searchTaskss(trimmedQuery).subscribe({
      next: (res: any[]) => {
        this.tasks = res;
        this.totalCount = res.length;
        this.completedCount = res.filter(t => t.status.toLowerCase() === 'completed').length;
        this.pendingCount = res.filter(t => t.status.toLowerCase() === 'in progress').length;
        this.newCount = res.filter(t => t.status.toLowerCase() === 'new').length;
      },
      error: (err: any) => console.error('Search error:', err)
    });
  }
  loadAllTasks(): void {
    this.taskService.getTasksss(this.currentPage, this.pageSize).subscribe({
      next: (res: { tasks: any[]; totalCount: number; }) => {
        this.tasks = res.tasks;
        this.totalCount = res.totalCount;
        this.completedCount = res.tasks.filter(t => t.status.toLowerCase() === 'completed').length;
        this.pendingCount = res.tasks.filter(t => t.status.toLowerCase() === 'in progress').length;
        this.newCount = res.tasks.filter(t => t.status.toLowerCase() === 'new').length;
      },
      error: (err: any) => console.error('Error fetching tasks:', err)
    });
  }
  
    
  selectedTab: 'user' | 'task' = 'user';


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
  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.loadAllTasks();
    }
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAllTasks();
    }
  }
  
  onLogout(): void {
    this.showLogoutConfirm = true;
  }
  getTypes(): void {
    this.taskService.getTypes().subscribe({
      next: (res: string[]) => {
        this.types = res;
        console.log('Types:', this.types);
      },
      error: (err: any) => {
        console.error('Error fetching types:', err);
      }
    });
  }
  goToUserDetails() {
    console.log("clicked");
    this.router.navigate(['/dashboard/admin-dashboard/user-details']);
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
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

  // Show/Hide task form
  toggleTaskForm(): void {
    this.showTaskForm = !this.showTaskForm;
  }

  createTask(): void {
    if (!this.newTask.name.trim()) {
      alert('Task name is required');
      return;
    }
  
    const selectedUser = this.users.find(u => u.username === this.newTask.username);
    if (!selectedUser) {
      console.error('Selected username not found');
      return;
    }
  
    const userId = selectedUser.id;
    this.taskService.createTask(userId, this.newTask).subscribe({
      next: (res: any) => {
        console.log('Task created successfully:', res);
        this.newTask = {name: '', description: '', status: 'new', type: 'general', Duedate: '',username: '' };
        this.showTaskForm = false;
      },
      error: (err: any) => {
        console.error('Error creating task:', err);
      }
    });
  }







  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
  
      this.http.post('https://localhost:7129/tasks/upload', formData).subscribe({
        next: (res: any) => {
          this.Message = "file uploaded successfully";
          this.isSuccessMessage = true;
          setTimeout(() => {
            this.Message = '';
          }, 5000);
          console.log('Upload success:', res);
        },
        error: (err: any) => {
          this.Message = "file upload failed";
          this.isSuccessMessage = false;
          setTimeout(() => {
            this.Message = '';
          }, 5000);
        }
      });
    }
  }
  
  
}