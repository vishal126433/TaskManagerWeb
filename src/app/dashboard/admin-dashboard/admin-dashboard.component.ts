import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { LeftMenuComponent } from '../../left-menu/left-menu.component';

import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'admin-dashboard',
  standalone: true,

  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  newTask = {
    name: '',
    description: '',
    status: 'pending',
    username:''

  };
  usernames: string[] = [];
  username: string = '';
  currentDate: string = '';
greetingTime: string = '';
users: any[] = [];  // add this to your component class


  totalUsers: number = 0;

  selectedUser: string = '';
  constructor(
    private router: Router,
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
  
    // Determine greeting
    const hour = now.getHours();
    if (hour < 12) this.greetingTime = 'Morning';
    else if (hour < 18) this.greetingTime = 'Afternoon';
    else this.greetingTime = 'Evening';

    this.http.get<any[]>('https://localhost:7129/users').subscribe({
      next: (res: any[]) => {
        this.users=res;
        this.usernames = res.map(u => u.username);
        this.totalUsers = this.usernames.length; // Store the count

      },
      error: (err: any) => {
        console.error('Error fetching usernames:', err);
      }
    });
  }
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
  // Logout logic
  onLogout(): void {
    this.showLogoutConfirm = true;
  }
  goToUserDetails() {
    console.log("clicked");
    this.router.navigate(['/dashboard/admin-dashboard/user-details']);
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

  // Submit task
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
    this.http.post(`https://localhost:7129/Tasks/create/${userId}`, this.newTask).subscribe({
      next: (res: any) => {
        console.log('Task created successfully:', res);
        this.newTask = { name: '', description: '', status: 'pending', username: '' };
        this.showTaskForm = false;
      },
      error: (err: any) => {
        console.error('Error creating task:', err);
      }
    });
    
    
  }
}