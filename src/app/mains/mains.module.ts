import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material';
import { DataCreateModalComponent } from './data-create-modal/data-create-modal.component';
import { ShinseishaModalComponent } from './shinseisha-modal/shinseisha-modal.component';
// import { DragDropModule } from '@angular/cdk/drag-drop';
import { PopupModule } from '../popup/popup.module';
import { DataEditModalComponent } from './data-edit-modal/data-edit-modal.component';
import { DataDeleteModalComponent } from './data-delete-modal/data-delete-modal.component';
import { DataApproveMultiModalComponent } from './data-approve-multi-modal/data-approve-multi-modal.component';
import { DataApproveSingleModalComponent } from './data-approve-single-modal/data-approve-single-modal.component';
import { DataPrintModalComponent } from './data-print-modal/data-print-modal.component';
import { PasswordChangeModalComponent } from './password-change-modal/password-change-modal.component';
import { DataHokenPrintModalComponent } from './data-hoken-print-modal/data-hoken-print-modal.component';


@NgModule({
  declarations: [MainComponent, DataCreateModalComponent, ShinseishaModalComponent,
    DataEditModalComponent, DataDeleteModalComponent, DataApproveMultiModalComponent,
    DataApproveSingleModalComponent,
    DataPrintModalComponent,
    PasswordChangeModalComponent,
    DataHokenPrintModalComponent],
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
    // DragDropModule,
    PopupModule,
  ],
  entryComponents: [
    DataCreateModalComponent,
    ShinseishaModalComponent,
    DataEditModalComponent,
    DataDeleteModalComponent,
    DataApproveMultiModalComponent,
    DataApproveSingleModalComponent,
    DataPrintModalComponent,
    PasswordChangeModalComponent,
    DataHokenPrintModalComponent,
  ],
  exports: [
    MainComponent,
  ]
})
export class MainsModule { }
