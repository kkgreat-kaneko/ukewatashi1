import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './core/login/login.component';
import { MainComponent } from './mains/main/main.component';
import { MaintenanceComponent } from './maintenance/maintenance/maintenance.component';


const routes: Routes = [
  { path: 'maintenance', component: MaintenanceComponent, canActivate: [AuthGuard]},
  { path: 'main', component: MainComponent, canActivate: [AuthGuard]},
  { path: '', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true, // ページリロード対応
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
