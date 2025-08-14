import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create mock services with Jasmine spies
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'scheduleRefresh']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully and navigate to dashboard', fakeAsync(() => {
    const mockResponse = {
      accessToken: 'dummy-token',
      role: 'admin'
    };    mockAuthService.login.and.returnValue(of(mockResponse));

    component.loginData = {
      email: 'test@example.com',
      password: 'password'
    };

    component.onLogin();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith(component.loginData);
    expect(sessionStorage.getItem('authToken')).toBe('dummy-token');
    expect(localStorage.getItem('isLoggedIn')).toBe('true');
    expect(mockAuthService.scheduleRefresh).toHaveBeenCalledWith('dummy-token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBe('');
  }));

  it('should show error message when access token is missing', fakeAsync(() => {
    const mockResponse = {
      accessToken: 'dummy-token',
      role: 'admin'
    };    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onLogin();
    tick();

    expect(component.errorMessage).toBe('No access token received.');
    expect(mockAuthService.scheduleRefresh).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  it('should handle login error', fakeAsync(() => {
    const mockError = { error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => mockError));

    component.onLogin();
    tick();

    expect(component.errorMessage).toBe('Invalid credentials');
  }));

  it('should navigate to register on onSign()', () => {
    component.onSign();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
  });
});
