import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material';
import { PopupAlertComponent } from './popup-alert/popup-alert.component';
import { PopupAlertYesNoComponent } from './popup-alert-yes-no/popup-alert-yes-no.component';



@NgModule({
  declarations: [PopupAlertComponent, PopupAlertYesNoComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatDialogModule,
  ],
  entryComponents: [
    PopupAlertComponent, PopupAlertYesNoComponent
  ],
  exports: [
    PopupAlertComponent, PopupAlertYesNoComponent
  ]
})
export class PopupModule { }
