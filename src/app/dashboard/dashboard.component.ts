import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'], 
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    AdminDashboardComponent,
    UserDashboardComponent
  ]
})
export class DashboardComponent {
  showLogoutConfirm = false;
  showTaskForm = false;
  role: string = ''; 



  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
        this.extractRoleFromToken();

  }
  extractRoleFromToken(): void {
    const token = sessionStorage.getItem('authToken'); // or localStorage
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; // role extraction
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }

 
}
