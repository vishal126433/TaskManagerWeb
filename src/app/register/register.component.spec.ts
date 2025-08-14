import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jasmine.createSpy('register')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if email is invalid', fakeAsync(() => {
    component.loginData = { email: 'invalid', username: 'user', password: 'pass' };
    component.onRegister();
    expect(component.Message).toBe('Please enter a valid email address');

    tick(3000);
    expect(component.Message).toBe('');
  }));

  it('should show error if username is blank', fakeAsync(() => {
    component.loginData = { email: 'test@example.com', username: '', password: 'pass' };
    component.onRegister();
    expect(component.Message).toBe('Username cannot be blank');

    tick(3000);
    expect(component.Message).toBe('');
  }));

  it('should show error if password is blank', fakeAsync(() => {
    component.loginData = { email: 'test@example.com', username: 'user', password: '' };
    component.onRegister();
    expect(component.Message).toBe('Password cannot be blank');

    tick(3000);
    expect(component.Message).toBe('');
  }));

  it('should register successfully and navigate to home', fakeAsync(() => {
    const mockResponse = { data: 'User registered!' };
    mockAuthService.register.and.returnValue(of(mockResponse));

    component.loginData = { email: 'test@example.com', username: 'user', password: 'pass' };
    component.onRegister();

    expect(mockAuthService.register).toHaveBeenCalledWith(component.loginData);
    expect(component.Message).toBe('User registered!');
    expect(component.isSuccessMessage).toBeTrue();

    tick(3000);
    expect(component.Message).toBe('');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle registration error', fakeAsync(() => {
    const mockError = {
      error: {
        message: 'Email already exists'
      }
    };
    mockAuthService.register.and.returnValue(throwError(() => mockError));

    component.loginData = { email: 'test@example.com', username: 'user', password: 'pass' };
    component.onRegister();

    expect(mockAuthService.register).toHaveBeenCalled();
    expect(component.Message).toBe('Email already exists');
    expect(component.isSuccessMessage).toBeFalse();

    tick(3000);
    expect(component.Message).toBe('');
  }));
});
