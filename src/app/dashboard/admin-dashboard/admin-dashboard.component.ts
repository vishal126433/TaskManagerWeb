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
import { HeaderComponent } from '../../header/header.component';
import * as XLSX from 'xlsx';


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
    HeaderComponent,
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
  selectedFile: File | null = null;
//   currentPage: number = 1;
// pageSize: number = 10;  // show 10 per page
  isCollapsed: boolean = false;
  searchText: string = '';
  userMap: Map<number, string> = new Map();
  private searchSubject = new Subject<string>();
  previewData: any[] = [];
previewColumns: string[] = [];
showImportPreview = false;
sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  newTask = {
    name: '',
    description: '',
    status: 'new',
    priority: '',
    type:'general',
    Duedate: '',
    assignedTo:''

  };
  Message = ''; 
  isSuccessMessage: boolean = false;
  usernames: string[] = [];
  username: string = '';
  currentDate: string = '';
greetingTime: string = '';
users: any[] = [];  
tasks: any[] = [];  
statuses: any[] = [];
priorities: any[] = [];
userList: any[] = []; 
selectedUserId: string = '';
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
totalPages: number = 0;  // Fixed: previously tried to assign a value to a getter
pagedPreviewData: any[] = []; // Declare pagedPreviewData as a variable

  selectedUser: string = '';
  constructor(
    private router: Router,
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.extractUsernameFromToken();
    this.getUsers();
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
    this.getTypes();
    this.getStatuses();
    this.getPriority();
    this.setupSearchListener();
    const hour = now.getHours();
    if (hour < 12) this.greetingTime = 'Morning';
    else if (hour < 18) this.greetingTime = 'Afternoon';
    else this.greetingTime = 'Evening';
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.data;
        this.usernames = res.data.map((u: any) => u.username);
        this.totalUsers = this.usernames.length;
      },
      error: (err: any) => {
        console.error('Error fetching usernames:', err);
      }
    });
    

    // this.taskService.getTasksss(this.currentPage, this.pageSize).subscribe({
    //   next: (res: any) => {
    //     const data = res.data;
    //     this.tasks = data.tasks;
    //     this.totalCount = data.totalCount;
    //     this.completedCount = data.completedCount;
    //     this.pendingCount = data.pendingCount;
    //     this.newCount = data.newCount;
    //   },
    //   error: (err: any) => {
    //     console.error('Error fetching tasks:', err);
    //   }
    // });
    this.loadAllTasks(); // Show full list again

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
    this.newTask = {name: '', description: '', status: 'new', type: 'general', Duedate: '',priority: '',assignedTo: '' };

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
      this.loadAllTasks(); // Show full list again
      return;
    }
  
    this.taskService.searchTaskss(trimmedQuery).subscribe({
      next: (res: any) => {
        this.tasks = res.data;
      },
      error: (err: any) => console.error('Search error:', err)
    });
  }
  
  loadAllTasks(): void {
    this.taskService.getTasksss(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.tasks = data.tasks;
        this.totalCount = data.totalCount;
        this.completedCount = data.completedCount;
        this.pendingCount = data.pendingCount;
        this.newCount = data.newCount;
      },
      error: (err: any) => console.error('Error fetching tasks:', err)
    });
  }

  selectedTab: 'task' | 'user' = 'task';

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
  onPageSizeChange(): void {
    this.currentPage = 1;  // Reset to first page
    this.loadAllTasks();   // Fetch tasks again with new pageSize
  }
  private formatDate(dateStr: string): string | null {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }
  
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100}`;
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
  
      this.http.post<any[]>('https://localhost:7129/tasks/upload', formData).subscribe({
        next: (taskList: any[]) => {
          if (taskList && taskList.length > 0) {
            this.previewData = taskList.map((task: any) => {
              const formattedDate = this.formatDate(task.duedate);
              return {
                ...task,
                assign: '',
                duedate: formattedDate,
                isInvalidDate: formattedDate === null
              };
            });
  
            this.previewColumns = this.getColumnHeaders(taskList[0]);
            this.totalPages = Math.ceil(this.previewData.length / this.pageSize);
            this.currentPage = 1;
            this.setPagedPreviewData();
            this.showImportPreview = true;
          } else {
            this.Message = "No tasks found in file";
            this.isSuccessMessage = false;
          }
  
          input.value = ''; // Clear file input after processing
        },
        error: () => {
          this.Message = "File upload failed";
          this.isSuccessMessage = false;
          setTimeout(() => this.Message = '', 5000);
        }
      });
    }
  }
  

getColumnHeaders(obj: any): string[] {
  const keys = Object.keys(obj);
  return keys.map(k => k === 'assign' ? 'Assign To' : k.charAt(0).toUpperCase() + k.slice(1));
}

setPagedPreviewData(): void {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  this.pagedPreviewData = this.previewData.slice(start, end);
}

changePage(direction: number): void {
  this.currentPage += direction;
  this.setPagedPreviewData();
}

getTypes(): void {
  this.taskService.getTypes().subscribe({
    next: (res: any) => {
      this.types = res.data;
      console.log('Types:', this.types);
    },
    error: (err: any) => {
      console.error('Error fetching types:', err);
    }
  });
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
  goToUserDetails() {
    console.log("clicked");
    this.router.navigate(['/dashboard/admin-dashboard/user-details']);
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

  // Show/Hide task form
  toggleTaskForm(): void {
    this.showTaskForm = !this.showTaskForm;
  }

  createTask(): void {
    if (!this.newTask.name.trim()) {
      alert('Task name is required');
      return;
    }
  
    const selectedUser = this.users.find(u => u.username === this.newTask.assignedTo);
    if (!selectedUser) {
      console.error('Selected username not found');
      return;
    }
  
    const userId = selectedUser.id;
    this.taskService.createTask(userId, this.newTask).subscribe({
      next: (res: any) => {
        console.log('Task created successfully:', res);
        this.newTask = {name: '', description: '', status: 'new', type: 'general', Duedate: '',priority: '',assignedTo: '' };
        this.showTaskForm = false;
        this.Message = "Task Created successfully";
        this.isSuccessMessage = true;
        setTimeout(() => this.Message = '', 5000);
      },
      
      error: (err: any) => {
        console.error('Error creating task:', err);
        this.Message = "Task Creation Failed";
        this.isSuccessMessage = false;
        setTimeout(() => this.Message = '', 5000);
      }
    });
  }


  confirmImport(): void {
    if (!this.previewData || this.previewData.length === 0) {
      console.error('No data to upload');
      return;
    }
  
    const processedData = this.previewData.map((item: any) => {
      const username = item["assign"]; // Adjust this if field is "Assign To" in Excel
      const matchedUser = this.users.find((u: any) => u.username === username);
  
      return {
        ...item,
        assign: username && matchedUser ? matchedUser.id.toString() : ""
      };
    });
  
    this.http.post('https://localhost:7129/tasks/upload-json', processedData).subscribe({
      next: (res: any) => {
        this.Message = "Data uploaded successfully";
        this.isSuccessMessage = true;
        setTimeout(() => this.Message = '', 5000);
        console.log('Upload success:', res);
      },
      error: (err: any) => {
        this.Message = "Data upload failed";
        this.isSuccessMessage = false;
        setTimeout(() => this.Message = '', 5000);
      }
    });
  
    this.showImportPreview = false;
    this.previewData = [];
    this.loadAllTasks(); 

    this.selectedFile = null;
  }

  cancelImport() {
    this.showImportPreview = false;
    this.previewData = [];
  this.selectedFile = null;
  }

 
  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res?.success && res.data) {
          this.tasks = res.data;
          this.userList = res.data; // Use this for your dropdown
          console.log('Users:', this.userList);
        } else {
          console.error('Unexpected response structure:', res);
        }
      },
      error: (err: any) => {
        console.error('Error fetching users:', err);
      }
    });
  }
  

  getUserss(): void {
    this.userService.getUsers().subscribe({
      next: (res: any[]) => {
        this.tasks = res;
        this.userMap = new Map(res.map(user => [user.userId, user.username]));
      },
      error: (err: any) => {
        console.error('Error fetching users:', err);
      }
    });
  }
  
 
  

}