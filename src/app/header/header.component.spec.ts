import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const mockAuthService = {
    logout: jasmine.createSpy('logout').and.returnValue(of(true))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent, 
        MatIconModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract username from valid token', () => {
    const mockPayload = {
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "testuser"
    };
    const base64Payload = btoa(JSON.stringify(mockPayload));
    const mockToken = `header.${base64Payload}.signature`;

    sessionStorage.setItem('authToken', mockToken);
    component.extractUsernameFromToken();

    expect(component.username).toBe('testuser');
  });

  it('should handle invalid token gracefully', () => {
    sessionStorage.setItem('authToken', 'invalid.token');
    spyOn(console, 'error');
    component.extractUsernameFromToken();

    expect(console.error).toHaveBeenCalled();
    expect(component.username).toBe('');
  });

  it('should set greetingTime based on current hour', () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      expect(component.greetingTime).toBe('Morning');
    } else if (hour < 18) {
      expect(component.greetingTime).toBe('Afternoon');
    } else {
      expect(component.greetingTime).toBe('Evening');
    }
  });

  it('should show logout confirmation on onLogout()', () => {
    component.onLogout();
    expect(component.showLogoutConfirm).toBeTrue();
  });

  it('should cancel logout confirmation on cancelLogout()', () => {
    component.cancelLogout();
    expect(component.showLogoutConfirm).toBeFalse();
  });

  it('should logout successfully and navigate to root', () => {
    sessionStorage.setItem('authToken', 'token');
    localStorage.setItem('isLoggedIn', 'true');

    component.confirmLogout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle logout error gracefully', () => {
    const errorService = {
      logout: jasmine.createSpy('logout').and.returnValue(throwError(() => new Error('Network error')))
    };

    component = new HeaderComponent(mockRouter as any, errorService as any);
    spyOn(console, 'error');
    component.confirmLogout();

    expect(console.error).toHaveBeenCalledWith('Logout failed:', jasmine.any(Error));
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
});
