import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  errorMessage = ''; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
  
        const accessToken = response?.data?.accessToken;
        if (!accessToken) {
          this.errorMessage = 'No access token received.';
          return;
        }
  
        sessionStorage.setItem('authToken', accessToken);
        this.authService.scheduleRefresh(accessToken);
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigate(['/dashboard']);
        this.errorMessage = '';
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        this.errorMessage = error?.error?.message || 'Login failed. Please try again later.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
  
  
  

  onSign() {
    this.router.navigate(['/register']);
  }
}
