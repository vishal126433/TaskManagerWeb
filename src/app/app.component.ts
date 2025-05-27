import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth.service';



@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class AppComponent {
  loginData = {
    username: '',
    password: ''
  };
  errorMessage = ''; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.initializeRefreshIfLoggedIn();
  }
  

  onLogin() {
    const url = 'http://localhost:5280/api/login';

    this.http.post(url, this.loginData).subscribe(
      (response:any) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);

        this.errorMessage = '';
      },
        (error: any) => {
          
          console.error('Login failed:', error);
          if (error.status === 401 && error.error === 'Invalid credentials') {
            this.errorMessage = 'Invalid username or password.';
          } else {
            this.errorMessage = 'Login failed. Please try again later.';
          }
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
    );
  }
}

