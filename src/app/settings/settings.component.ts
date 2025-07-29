import { Component } from '@angular/core';
import { LeftMenuComponent } from '../left-menu/left-menu.component';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';

import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-settings',
  imports: [FormsModule,LeftMenuComponent,MatButtonModule,HeaderComponent,MatMenuModule,MatInputModule,MatFormFieldModule,HttpClientModule,CommonModule,MatIconModule,MatCardModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  isCollapsed: boolean = false;
  username: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  oldPassword: any;

  clearFields() {
    this.newPassword = '';
    this.oldPassword = '';
    this.confirmPassword = '';
  }


  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
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

  changePassword() {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Please fill in both password fields.');
      return;
    }
  
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    const requestBody = {
      username: this.username,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };
  
    this.http.put('https://localhost:7027/Auth/change-password', requestBody).subscribe({
      next: () => {
        alert('Password changed successfully.');
        this.clearFields();
      },
      error: (error: any) => {
        console.error('Error changing password:', error);
        // alert('Failed to change password.');
      }
    });
  }
  
  constructor(private http: HttpClient, private router: Router) {
    this.extractUsernameFromToken();

  }




}
