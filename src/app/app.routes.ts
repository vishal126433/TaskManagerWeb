import { AuthGuard } from './auth.guard';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { UserDetailsComponent } from './dashboard/admin-dashboard/user-details/user-details.component';



export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]  // Protect dashboard route with AuthGuard
  },
  { path: 'register',
    component: RegisterComponent 
  } , 
  {
     path: 'dashboard/admin-dashboard/user-details', 
     component: UserDetailsComponent },


];
