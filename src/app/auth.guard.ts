import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running AuthGuard on browser');
      const token = sessionStorage.getItem('authToken');

      console.log('Token found in sessionStorage:', token);
      if (token) return true;
    }
    console.log('AuthGuard: Redirecting to login');
    this.router.navigate(['/']);
    return false;
  }
  
}
