import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-popup-alert-yes-no',
  templateUrl: './popup-alert-yes-no.component.html',
  styleUrls: ['./popup-alert-yes-no.component.css']
})
export class PopupAlertYesNoComponent implements OnInit {
  closeNo = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<PopupAlertYesNoComponent>,
  ) { }

  ngOnInit() {
  }

  public ok() {
    this.dialogRef.close();
  }

  public no() {
    this.dialogRef.close(this.closeNo);
  }

}

export interface DialogData {
  title: string;
  message: string;
}