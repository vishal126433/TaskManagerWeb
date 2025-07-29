import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; 
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';




@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  showLogoutConfirm = false;
  currentDate: string = '';
  greetingTime: string = '';
  username: string = '';


  constructor(
    private router: Router,
    private authService: AuthService,

  ) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
    this.extractUsernameFromToken();

    const hour = now.getHours();
    this.greetingTime = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
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
  onLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
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

}
