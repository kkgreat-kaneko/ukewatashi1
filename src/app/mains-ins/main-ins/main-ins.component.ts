import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder} from '@angular/forms';
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
import { Hokengaisha } from '../../class/hokengaisha';


@Component({
  selector: 'app-main-ins',
  templateUrl: './main-ins.component.html',
  styleUrls: ['./main-ins.component.css']
})
export class MainInsComponent implements OnInit {
  message: string;                                                    // 処理エラーメッセージ用
  msg: string[];                                                      // popupメッセージ本文
  loginUser = new Hokengaisha();                                      // ログインユーザー情報用
  kanriList: Kanri[];                                                 // 一覧データ
  resetKanriList: Kanri[];                                            // 一覧データ復元用(申請者区分検索データから元データ復元用)
  kaisha: string;                                                     // 保険担当がログインした会社画面(JLX/JLXHS)
  searchedKanriList: Kanri[];                                         // 申請者、区分検索用一覧データ
  selectedKanriList: Kanri[]                                          // 一覧チェック済データ用リスト

  /*status選択value　バックエンド処理と紐付き有り。変更注意*/
  frmStatusDlvry = Const.FRM_STATUS_DLVRY;                            // 郵送分
  frmStatusEnd = Const.FRM_STATUS_END;                                // 印刷済分
  frmStatusOk = Const.FRM_STATUS_OK;                                  // 確認済分
  frmStatusNot = Const.FRM_STATUS_NOT;                                // 未確認分

  formGroup: FormGroup;
  status = new FormControl(String(this.frmStatusNot));                // status絞込み
  beforeKanriNo = new FormControl('');                                // 管理No.以前
  limit = new FormControl('1000');                                    // 表示件数1000デフォルト値
  shinseisha = new FormControl('all');                                // 申請者選択
  kubun = new FormControl('all');                                     // 区分選択

  frmShinseisha: string[];                                            // 申請者選択用データ
  frmKubun: string[];                                                 // 区分選択用データ

  selection = new SelectionModel<Kanri>(true, []);
  private cbEmmiter = this.selection.onChange.asObservable();


  constructor(private kanriService: KanriService, private sessionService: SessionService, private dialog: MatDialog,
    private popupAlertDialog: MatDialog, private router: Router, private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.loginUser = this.sessionService.getHokenLoginTantou();
    this.kaisha = this.sessionService.getHokenLoginKaisha();
    /*debug*///console.log(this.loginUser);
    this.formGroup = this.fb.group({                                  // フォームグループ初期化
      status: this.status,                                            // 書類ステータス
      beforeKanriNo: this.beforeKanriNo,                              // 管理No
      limit: this.limit,                                              // 表示件数
      shinseisha: this.shinseisha,                                    // 申請者
      kubun: this.kubun                                               // 区分
    });
    
    this.getListByHokengaisha();                                      // 書類一覧検索出力処理
    
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.selectedKanriList = cb.source.selected;
        /*debug*/console.log(this.selectedKanriList);
      } else {
        // nothing any
      }
    });

    this.getCheckByHokengaisha();                                     // 初期化書類データstatus別チェックMSG出力処理
  }

  /*
  *  書類一覧用データ検索処理
  *
  */
  public getListByHokengaisha() {
    /*
    *  検索値セット　バックエンドへ渡す固定値(JLXorJLXHX、保険会社、*承認済statusバックエンド固定)と
    *  フォーム選択値(管理No以前、表示件数、status)
    */
    const kanri = new Kanri();
    kanri.sKaisha = [this.kaisha];
    kanri.hokengaisha = this.loginUser.hokengaisha;
    kanri.status = this.formGroup.value.status;
    if (this.formGroup.value.beforeKanriNo) {
      kanri.beforeId = this.formGroup.value.beforeKanriNo;
    }
    kanri.limit = this.formGroup.value.limit;

    this.kanriService.getListByHokengaisha(kanri)
    .then(res => {
      this.kanriList = res;                                           // 一覧データセット
      this.resetKanriList = res;                                      // 一覧データ復元用をセット（検索申請者、区分データから復元用)
      this.setShinseishaAndKubun(this.kanriList);                     // 検索用申請者、区分のセレクトOption値をセット
      this.shinseisha.reset('all');                                   // 検索用申請者の選択状態をリセット--->すべて
      this.kubun.reset('all');                                        // 検索用区分の選択状態をリセット--->すべて
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });
  }

  /*
  * 申請者選択、区分選択、Option用データ作成処理
  */
  public setShinseishaAndKubun(kanriList: Kanri[]) {
    this.frmShinseisha = [];
    let arrShinseisha: string[] = [];
    let arrKubun: string[] = [];
    this.frmKubun = [];
    kanriList.forEach(kanri => {
      arrShinseisha.push(kanri.shinseisha);
      arrKubun.push(kanri.kubun);
    });
    this.frmShinseisha = arrShinseisha.filter(function(x, i, self) {
      return self.indexOf(x) === i;
    });
    this.frmKubun = arrKubun.filter(function(x, i, self) {
      return self.indexOf(x) === i;
    });
  }

  /*
  *  申請者、区分の検索選択時、処理
  */
  public searchShinseiKubun() {
    let shinseisha = this.formGroup.value.shinseisha;
    let kubun = this.formGroup.value.kubun;
    this.kanriList = this.resetKanriList;
    this.searchedKanriList = [];
    
    if (shinseisha === 'all' && kubun === 'all') {
      return;
    } else {
      this.kanriList.forEach(kanri => {
        /* 申請者と区分を検索 */
        if (shinseisha !== 'all' && kubun !== 'all') {
          if (kanri.shinseisha === shinseisha && kanri.kubun === kubun) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 申請者を検索 */
        if (shinseisha !== 'all' && kubun === 'all') {
          if (kanri.shinseisha === shinseisha) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 区分を検索 */
        if (shinseisha === 'all' && kubun !== 'all') {
          if (kanri.kubun === kubun) {
            this.searchedKanriList.push(kanri);
          }
        }
      });
      this.kanriList = this.searchedKanriList;
    }
  }

  /*
  *  保険会社初期化チェック処理
  *  未確認分(status:0,3)の有無、不備書類(status:3)の有無、確認済分(status:1)の有無を
  *  各データ件数よりチェックして条件別にMSGをセット出力する
  */
  public getCheckByHokengaisha() {
    console.log('test');
    
    const kanri = new Kanri();
    kanri.sKaisha = [this.kaisha];
    kanri.hokengaisha = this.loginUser.hokengaisha;
    this.msg = [];
    this.kanriService.getCheckByHokengaisha(kanri)
    .then(res => {
      const statusNot = res[0].paramLongs[0];
      const statusNg = res[0].paramLongs[1];
      const statusOk = res[0].paramLongs[2];
      if (statusNot === 0 && statusOk === 0) {
        this.msg.push('現在のところ御社向けの受渡し書類はありません。');
      }
      if (statusNg > 0) {
        this.msg.push('書類不備の案件があります。');
      }
      if (statusOk > 0) {
        this.msg.push('確認済みで確認書を印刷していない案件があります。');
      }
      if (this.msg.length > 0) {
        const msg = {
          title: '',
          message: this.msg,
        };
        this.showAlert(msg);
      }

    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });
    
  }

  /*
  *  終了ボタン
  *  保険会社JLXログインへ移動
  */
  public logout() {
    this.router.navigate(['/login-ins-jlx']);
  }

  /*
  * POPUPメッセージ
  * 引数インターフィイスMsg　ソース最後に宣言
  */
  public showAlert(msg: Msg) {
    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
      restoreFocus: false,                  // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      // autoFocus: false,                  // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        // nullデータ戻りチェック必須（無いとプログラムエラー)
        if (data) {
        }
      },
      error => {
        console.log('error');
      }
    );
  }
}

/* --------------------------------------------------------------------------------- */
/*
*  POPUPダイアログメッセージ用インターフェイス
*/
export interface Msg {
  title: string;          // ダイアログタイトル名をセット
  message: string[];        // ダイアログメッセージをセット
}

