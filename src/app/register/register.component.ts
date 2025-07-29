import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  imports: [ CommonModule,
    RouterOutlet,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  loginData = {
    username: '',
    email:'',
    password: ''
  };
  Message = ''; 
  isSuccessMessage: boolean = false;


  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService

  ) {}

  onRegister() {
    //  Client-side validation before API call
    if (!this.loginData.email || !this.loginData.email.includes('@')) {
      this.Message = 'Please enter a valid email address';
      this.isSuccessMessage = false;
    } else if (!this.loginData.username) {
      this.Message = 'Username cannot be blank';
      this.isSuccessMessage = false;
    } else if (!this.loginData.password) {
      this.Message = 'Password cannot be blank';
      this.isSuccessMessage = false;
    }
  
    if (this.Message) {
      setTimeout(() => this.Message = '', 3000);
      return;
    }
  
    // ✅ Call register API
    this.authService.register(this.loginData).subscribe({
      next: (response: any) => {
        console.log('Register successful:', response);
        this.Message = response?.data || 'Registered successfully';
        this.isSuccessMessage = true;
  
        setTimeout(() => {
          this.Message = '';
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        this.Message = error?.error?.message || 'Registration failed. Please try again.';
        this.isSuccessMessage = false;
  
        setTimeout(() => this.Message = '', 3000);
      }
    });
  }
  
  

}
