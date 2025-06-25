import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LeftMenuComponent } from '../../../left-menu/left-menu.component';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-details',
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
    MatInputModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  showLogoutConfirm = false;
  showTaskForm = false;
  isEditMode = false;
  isViewMode = false;
  isCollapsed: boolean = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  Message = ''; 
  isSuccessMessage: boolean = false;


  newUser = {
    id: 0,
    Username: '',
    Email: '',
    Role: 'User',
    password:''
  };

  tasks: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,

    private http: HttpClient
  ) {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({

    // this.http.get<any[]>('https://localhost:7129/Users').subscribe({
      next: (res: any[]) => {
        this.tasks = res;
        console.log('Tasks:', this.tasks);
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }


  onView(task: any): void {
    this.newUser = {
      id: task.id,
      Username: task.username,
      Email: task.email,
      Role: task.role,
      password: task.password  
    };
    this.isViewMode = true;
    this.isEditMode = false;
    this.showTaskForm = true;
  }
  
  onEdit(task: any): void {
    this.newUser = {
      id: task.id,
      Username: task.username,
      Email: task.email,
      Role: task.role,
      password: task.password 
    };
    this.isEditMode = true;
    this.isViewMode = false;
    this.showTaskForm = true;
  }
  

  
  onTaskList(userId: number) {
    this.router.navigate(['dashboard/admin-dashboard/task-list', userId]);
  }
  
  



  saveEditedUser(): void {
    this.userService.saveEditedUser(this.newUser).subscribe({

    // this.http.put(`https://localhost:7129/Users/${this.newUser.id}`, this.newUser).subscribe({
      next: () => {
        console.log('Task updated successfully');
        this.resetForm();
        this.getUsers();
        this.Message = "Task updated successfully";
        this.isSuccessMessage = true;
        setTimeout(() => {
          this.Message = '';
        }, 5000);
      },
      error: (err: any) => {
        console.error('Error updating task:', err);
        this.Message = "Task updation failed";
        this.isSuccessMessage = false;
        setTimeout(() => {
          this.Message = '';
        }, 5000);
      }
    });
  }

  onDelete(user: any): void {
    const confirmed = confirm(`Are you sure you want to delete the user`);
    if (confirmed) {
      this.userService.onDelete(user.id).subscribe({


      // this.http.delete(`https://localhost:7129/Users/${task.id}`).subscribe({
        next: () => {
          this.Message = "deleted successfully";
          this.isSuccessMessage = true;
          console.log('Task deleted successfully');
          this.getUsers();
          setTimeout(() => {
            this.Message = '';
          }, 5000);
        },
        error: (err: any) => {
          console.error('Error deleting task:', err);
          this.Message = "deletion fails";
          this.isSuccessMessage = false;
          setTimeout(() => {
            this.Message = '';
          }, 5000);
        }
      });
    }
  }

  createUser(): void {
    if (!this.newUser.Username.trim()) {
      alert('Task name is required');
      return;
    }
    this.userService.createUser(this.newUser).subscribe({


    // this.http.post('https://localhost:7129/Users/create', this.newUser).subscribe({
      next: (res: any) => {
        console.log('Task created successfully:', res);
        this.resetForm();
        this.getUsers();
        this.Message = "Task created successfully";
          this.isSuccessMessage = true;
        setTimeout(() => {
          this.Message = '';
        }, 5000);
      },
      error: (err: any) => {
        console.error('Error creating task:', err);
        this.Message = "Task creation fails";
          this.isSuccessMessage = false;
        setTimeout(() => {
          this.Message = '';
        }, 5000);
      }
    });
  }

  resetForm(): void {
    this.newUser = { id: 0, Username: '', Email: '', Role: '',password: ''};
    this.isEditMode = false;
    this.showTaskForm = false;
    this.isViewMode = false;

  }

  toggleTaskForm(): void {
    this.resetForm();            
    this.showTaskForm = true;     
    this.isEditMode = false;      
  }
  

  // Logout logic
  onLogout(): void {
    this.showLogoutConfirm = true;
  }
  onBack(): void {
    this.router.navigate(['/dashboard']);
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

