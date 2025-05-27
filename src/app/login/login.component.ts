import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
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
    const url = 'https://localhost:7027/Auth/login';

    this.http.post<any>(url, this.loginData, { withCredentials: true }) // Ensures cookies like refresh token are sent
      .subscribe({
        next: (response: { accessToken: string, role: string; }) => {
          console.log('Login successful:', response);
          sessionStorage.setItem('authToken', response.accessToken); //  Confirm this matches backend field name
          sessionStorage.setItem('userRole', response.role); // Save role

          this.authService.scheduleRefresh(response.accessToken);
          localStorage.setItem('isLoggedIn', 'true');
          this.router.navigate(['/dashboard']);
          this.errorMessage = '';
        },
        error: (error: { status: number; }) => {
          console.error('Login failed:', error);
          this.errorMessage = error.status === 401
            ? 'Invalid username or password.'
            : 'Login failed. Please try again later.';

          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  onSign() {
    this.router.navigate(['/register']);
  }
}
