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
      next: (response: { accessToken: string; }) => {
        console.log('Login successful:', response);
        sessionStorage.setItem('authToken', response.accessToken);
        this.authService.scheduleRefresh(response.accessToken);
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigate(['/dashboard']);
        this.errorMessage = '';
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        // Show backend message if exists
        if (error.error.message && error.error) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
  
  

  onSign() {
    this.router.navigate(['/register']);
  }
}
