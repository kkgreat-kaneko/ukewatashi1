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
  testData: KanriData[] = [
    {status: 0,
      id: 257001,
      shoukenbango: '123456',
      keiyakusha: '金子　丘',
      kubun: '新規加入者',
      shinseisha: '管理者ユーザー',
      saishuhenshubi: '2020/06/19',
      //seiho: number;
      bikou: '備考特になし!!' },
      {status: 0,
        id: 257001,
        shoukenbango: '123456',
        keiyakusha: '金子　丘',
        kubun: '新規加入者',
        shinseisha: '管理者ユーザー',
        saishuhenshubi: '2020/06/19',
        //seiho: number;
        bikou: '備考特になし!!' },
        {status: 0,
          id: 257001,
          shoukenbango: '123456',
          keiyakusha: '金子　丘',
          kubun: '新規加入者',
          shinseisha: '管理者ユーザー',
          saishuhenshubi: '2020/06/19',
          //seiho: number;
          bikou: '備考特になし!!' },
          {status: 0,
            id: 257001,
            shoukenbango: '123456',
            keiyakusha: '金子　丘',
            kubun: '新規加入者',
            shinseisha: '管理者ユーザー',
            saishuhenshubi: '2020/06/19',
            //seiho: number;
            bikou: '備考特になし!!' },
            {status: 0,
              id: 257001,
              shoukenbango: '123456',
              keiyakusha: '金子　丘',
              kubun: '新規加入者',
              shinseisha: '管理者ユーザー',
              saishuhenshubi: '2020/06/19',
              //seiho: number;
              bikou: '備考特になし!!' },
    {status: 0,
      id: 257001,
      shoukenbango: '123456',
      keiyakusha: '金子　丘',
      kubun: '新規加入者',
      shinseisha: '管理者ユーザー',
      saishuhenshubi: '2020/06/19',
      //seiho: number;
      bikou: '備考特になし!!' }
  ]

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

/*test delete this line */
export interface KanriData {
  status: number;
  id: number;
  shoukenbango: string;
  keiyakusha: string;
  kubun: string;
  shinseisha: string;
  saishuhenshubi: string;
  //seiho: number;
  bikou: string;
}
