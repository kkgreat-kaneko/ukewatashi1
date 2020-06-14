import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './core/login/login.component';
import { MainComponent } from './mains/main/main.component';
import { MaintenanceComponent } from './maintenance/maintenance/maintenance.component';
import { MstTantoushaComponent } from './mst-tantousha/mst-tantousha/mst-tantousha.component';
import { MstHokengaishaComponent } from './mst-hokengaisha/mst-hokengaisha/mst-hokengaisha.component';
import { MstHokengaishaListComponent } from './mst-hokengaisha-list/mst-hokengaisha-list/mst-hokengaisha-list.component';
import { MstKubunComponent } from './mst-kubun/mst-kubun/mst-kubun.component';

const routes: Routes = [
  { path: 'mst-kubun', component: MstKubunComponent, canActivate: [AuthGuard]},
  { path: 'mst-hokengaisha-list', component: MstHokengaishaListComponent, canActivate: [AuthGuard]},
  { path: 'mst-hokengaisha', component: MstHokengaishaComponent, canActivate: [AuthGuard]},
  { path: 'mst-tantousha', component: MstTantoushaComponent, canActivate: [AuthGuard]},
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
