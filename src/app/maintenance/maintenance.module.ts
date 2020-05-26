import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PopupModule } from '../popup/popup.module';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { HokengaishaListOrderComponent } from './hokengaisha-list-order/hokengaisha-list-order.component';
import { KubunOrderComponent } from './kubun-order/kubun-order.component';


@NgModule({
  declarations: [MaintenanceComponent, HokengaishaListOrderComponent, KubunOrderComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    DragDropModule,
    PopupModule,
  ],
  entryComponents: [
    HokengaishaListOrderComponent,
    KubunOrderComponent,
  ],
  exports: [
    MaintenanceComponent,
  ]
})
export class MaintenanceModule { }
