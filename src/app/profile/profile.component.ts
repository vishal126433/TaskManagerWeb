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
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from '../header/header.component';


import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [LeftMenuComponent,MatButtonModule,MatMenuModule,HeaderComponent,MatInputModule,MatFormFieldModule,HttpClientModule,CommonModule,MatIconModule,MatCardModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  isCollapsed: boolean = false;
  username: string = '';
  showLogoutConfirm = false;



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
  constructor(private http: HttpClient, private router: Router, private authService: AuthService
    ) {
    this.extractUsernameFromToken();

  }
 



  

}
