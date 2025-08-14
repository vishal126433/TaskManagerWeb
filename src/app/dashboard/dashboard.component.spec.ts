import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  
  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule // provides Router + events observable

      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => null }), // mock route params
            snapshot: { paramMap: { get: () => null } }
          }
        }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });
  

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render AdminDashboardComponent if role is Admin', () => {
    component.role = 'Admin';
    fixture.detectChanges();
    const admin = fixture.debugElement.query(By.css('admin-dashboard'));
    const user = fixture.debugElement.query(By.css('user-dashboard'));
    expect(admin).toBeTruthy();
    expect(user).toBeFalsy();
  });

  it('should render UserDashboardComponent if role is User', () => {
    component.role = 'User';
    fixture.detectChanges();
    const admin = fixture.debugElement.query(By.css('admin-dashboard'));
    const user = fixture.debugElement.query(By.css('user-dashboard'));
    expect(user).toBeTruthy();
    expect(admin).toBeFalsy();
  });

  it('should render nothing if role is neither Admin nor User', () => {
    component.role = 'Guest';
    fixture.detectChanges();
    const admin = fixture.debugElement.query(By.css('admin-dashboard'));
    const user = fixture.debugElement.query(By.css('user-dashboard'));
    expect(admin).toBeFalsy();
    expect(user).toBeFalsy();
  });
});

