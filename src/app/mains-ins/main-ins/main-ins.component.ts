import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Const } from '../../class/const';
import { Tantousha } from '../../class/tantousha';
import { Kanri } from '../../class/kanri';
import { SessionService } from '../../service/session.service';
import { KanriService } from '../../service/kanri.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';


@Component({
  selector: 'app-main-ins',
  templateUrl: './main-ins.component.html',
  styleUrls: ['./main-ins.component.css']
})
export class MainInsComponent implements OnInit {

  constructor(private kanriService: KanriService, private sessionService: SessionService, private dialog: MatDialog,
    private popupAlertDialog: MatDialog, private router: Router,
  ) { }

  ngOnInit() {
  }

  /*
  *  終了ボタン
  *  保険会社JLXログインへ移動
  */
  public logout() {
    this.router.navigate(['/login-ins-jlx']);
  }

}
