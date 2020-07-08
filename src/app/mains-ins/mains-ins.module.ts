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
import { PopupModule } from '../popup/popup.module';
import { MainInsComponent } from './main-ins/main-ins.component';
import { DataCheckModalComponent } from './data-check-modal/data-check-modal.component';
import { PwdPrtConfirmModalComponent } from './pwd-prt-confirm-modal/pwd-prt-confirm-modal.component';
import { PwdUndoStatusToOkModalComponent } from './pwd-undo-status-to-ok-modal/pwd-undo-status-to-ok-modal.component';
import { PwdUndoStatusToNotModalComponent } from './pwd-undo-status-to-not-modal/pwd-undo-status-to-not-modal.component';


@NgModule({
  declarations: [MainInsComponent, DataCheckModalComponent, PwdPrtConfirmModalComponent, PwdUndoStatusToOkModalComponent, PwdUndoStatusToNotModalComponent],
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
    PopupModule,
  ],
  entryComponents: [
    DataCheckModalComponent,
    PwdPrtConfirmModalComponent,
    PwdUndoStatusToOkModalComponent,
    PwdUndoStatusToNotModalComponent
  ],
  exports: [
    MainInsComponent
  ]
})
export class MainsInsModule { }
