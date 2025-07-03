import { AuthGuard } from './auth.guard';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { RegisterComponent } from './register/register.component';
import { UserDetailsComponent } from './dashboard/admin-dashboard/user-details/user-details.component';
import { TaskListComponent } from './dashboard/admin-dashboard/task-list/task-list.component';


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
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]  // Protect dashboard route with AuthGuard
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]  // Protect dashboard route with AuthGuard
  },
  { path: 'register',
    component: RegisterComponent ,
  } , 
  {
     path: 'dashboard/admin-dashboard/user-details', 
     component: UserDetailsComponent,
     canActivate: [AuthGuard]
     },

     { path: 'dashboard/admin-dashboard/task-list/:userId',
      component: TaskListComponent,
      canActivate: [AuthGuard]
     }



];
