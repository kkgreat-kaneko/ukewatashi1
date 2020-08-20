import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { FormControl, FormGroup, FormBuilder} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Const } from '../../class/const';
import { Kanri } from '../../class/kanri';
import { RequestDto } from '../../class/request-dto';
import { SessionService } from '../../service/session.service';
import { KanriService } from '../../service/kanri.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { PopupAlertYesNoComponent } from '../../popup/popup-alert-yes-no/popup-alert-yes-no.component';
import { Hokengaisha } from '../../class/hokengaisha';
import { DataCheckModalComponent } from '../data-check-modal/data-check-modal.component';
import { PwdPrtConfirmModalComponent } from '../pwd-prt-confirm-modal/pwd-prt-confirm-modal.component';
import { PwdUndoStatusToOkModalComponent } from '../pwd-undo-status-to-ok-modal/pwd-undo-status-to-ok-modal.component';
import { PwdUndoStatusToNotModalComponent } from '../pwd-undo-status-to-not-modal/pwd-undo-status-to-not-modal.component';
import { PwdReprtConfirmModalComponent } from '../pwd-reprt-confirm-modal/pwd-reprt-confirm-modal.component';


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

  /*status選択value　バックエンド処理と紐付き有り。変更注意 View側でConst定数を使用できないので代入*/
  frmStatusDlvry = Const.FRM_STATUS_DLVRY;                            // 郵送分
  frmStatusEnd = Const.FRM_STATUS_END;                                // 印刷済分
  frmStatusOk = Const.FRM_STATUS_OK;                                  // 確認済分
  frmStatusNot = Const.FRM_STATUS_NOT;                                // 未確認分

  formGroup: FormGroup;
  status = new FormControl(String(this.frmStatusNot));                // status絞込み
  beforeKanriNo = new FormControl('');                                // 管理No.以前
  limit = new FormControl('300');                                    // 表示件数1000デフォルト値
  shinseisha = new FormControl('all');                                // 申請者選択
  kubun = new FormControl('all');                                     // 区分選択
  kakuninbi = new FormControl('');                                    // 確認日選択

  frmShinseisha: string[];                                            // 申請者選択用データ
  frmKubun: string[];                                                 // 区分選択用データ

  selection = new SelectionModel<Kanri>(true, []);                    // リストチェックボックス用セレクション true=複数選択可
  private cbEmmiter = this.selection.onChange.asObservable();         // セレクションChangeイベント登録

  shoruiCheckBtnDisabled = false;                                     // 書類チェックボタンdisable設定用（初期値解除 未確認分表示の為)


  constructor(private kanriService: KanriService, private sessionService: SessionService, private dialog: MatDialog,
    private popupAlertDialog: MatDialog, private popupAlertYesNoDialog: MatDialog, private router: Router, private fb: FormBuilder,
  ) { }

  ngOnInit() {
    /* ブラウザ戻るボタン禁止 */
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
      history.go(1);
    });
    
    this.loginUser = this.sessionService.getHokenLoginTantou();
    this.kaisha = this.sessionService.getHokenLoginKaisha();          // 保険会社ログイン JLX/JLXHS向けどちらのログインか返す
    this.formGroup = this.fb.group({                                  // フォームグループ初期化
      status: this.status,                                            // 書類ステータス
      beforeKanriNo: this.beforeKanriNo,                              // 管理No
      limit: this.limit,                                              // 表示件数
      shinseisha: this.shinseisha,                                    // 申請者
      kubun: this.kubun,                                              // 区分
      kakuninbi: this.kakuninbi                                       // 確認日検索
    });
    
    this.getListByHokengaisha();                                      // 書類一覧検索出力処理
    
    this.cbEmmiter.subscribe(cb => {                                  // 一覧チェックボックスイベント発火購読サブスク処理
      if (cb.source.selected.length > 0) {
        this.selectedKanriList = cb.source.selected;                  // チェック有り--->すべてリスト保持(配列)

      } else {                                                        // チェック無し--->保持リスト初期化
        this.selectedKanriList = null;
      }
    });

    this.getCheckByHokengaisha();                                     // 初期化書類データstatus別チェックMSG出力処理
  }

  /*
  *  書類一覧用データ検索処理
  *  statusの選択値によって書類チェックボタンdisabled設定含む
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
      this.kakuninbi.reset('');                                       // 検索用確認日の選択状態をリセット--->ブランク
      this.selection.clear();                                         // 書類チェックボタン状態リセット
      if (this.status.value === String(Const.FRM_STATUS_DLVRY)        // 書類チェックボタンdisabled設定
           || this.status.value === String(Const.FRM_STATUS_END)) {
        this.shoruiCheckBtnDisabled = true;
      } else {
        this.shoruiCheckBtnDisabled = false;
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
  *  申請者、区分、最終確認日、検索選択時、処理  リスト上の確認日はsaishuKakuninbiなので要注意
  */
  public searchShinseiKubun() {
    let shinseisha = this.formGroup.value.shinseisha;
    let kubun = this.formGroup.value.kubun;
    let kakuninbi = this.sessionService.formatDatePicker(this.kakuninbi.value);   // DatePicker日付を整形ゼロ埋めした年月日を返す
    this.kanriList = this.resetKanriList;
    this.searchedKanriList = [];
    
    if (shinseisha === 'all' && kubun === 'all' && !kakuninbi) {
      return;
    } else {
      this.kanriList.forEach(kanri => {
        /* 作成日View用整形日付（時間を省略) */
        let dataKakuninbi = '';
        if (kanri.saishuKakuninbi) {
          dataKakuninbi = kanri.saishuKakuninbi.substr(0, 10);
        }
        /* 申請者と区分と確認日を検索 */
        if (shinseisha !== 'all' && kubun !== 'all' && kakuninbi ) {
          if (kanri.shinseisha === shinseisha && kanri.kubun === kubun && dataKakuninbi === kakuninbi) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 申請者と区分を検索(確認日選択なし) */
        if (shinseisha !== 'all' && kubun !== 'all' && !kakuninbi) {
          if (kanri.shinseisha === shinseisha && kanri.kubun === kubun) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 申請者を検索(区分と確認日選択なし) */
        if (shinseisha !== 'all' && kubun === 'all' && !kakuninbi) {
          if (kanri.shinseisha === shinseisha) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 申請者と確認日を検索(区分選択なし) */
        if (shinseisha !== 'all' && kubun === 'all' && kakuninbi) {
          if (kanri.shinseisha === shinseisha　&& dataKakuninbi === kakuninbi) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 区分を検索(申請者と確認日選択なし) */
        if (shinseisha === 'all' && kubun !== 'all' && !kakuninbi) {
          if (kanri.kubun === kubun) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 区分と確認日を検索(申請者選択なし) */
        if (shinseisha === 'all' && kubun !== 'all' && kakuninbi) {
          if (kanri.kubun === kubun && dataKakuninbi === kakuninbi) {
            this.searchedKanriList.push(kanri);
          }
        }
        /* 確認日を検索(申請者と区分選択なし) */
        if (shinseisha === 'all' && kubun === 'all' && kakuninbi) {
          if (dataKakuninbi === kakuninbi) {
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
  *  書類チェックボタン処理
  *
  */
  public showCheckKanri(kanri: Kanri) {
    const dialogRef = this.dialog.open(DataCheckModalComponent, {
      data: kanri,                    // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要(ダミー的な)
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
      height: '670px',                // default maxHeightサイズ500px超え maxHeigth指定必要
      maxHeight: '670px',             // maxHeith　デフォルト値変更　*コンポーネント側CSS mat-dialog-contentの指定も必要
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
        }
        this.getListByHokengaisha();               // 書類一覧更新表示
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  確認書印刷ボタン処理
  *  印刷認証処理を行い、OKなら出力確認処理を実行
  */
  public showPwdPrtConfirm() {
    const kanri = new Kanri();
    kanri.shinseishaKaisha = this.kaisha;
    kanri.hokengaisha = this.loginUser.hokengaisha;
    /*印刷データ有無の事前チェック*/
    this.kanriService.chkHokenConfirm(kanri)
    .then(res => {
      if(!res) {
        let message = ['確認済の案件はありません。'];
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
      }else {
        const dialogRef = this.dialog.open(PwdPrtConfirmModalComponent, {
          data: kanri,                    // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要(ダミー的な)
          disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
          restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
          autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
        });
        // ダイアログ終了後処理 
        dialogRef.afterClosed()
        .subscribe(
          data => {
            if (data) {
              let message = ['印刷すると、確認日時の入った案件については修正が', 'できなくなります。印刷してもよろしいですか?'];
              const msg = {
                title: '',
                message: message,
              };
              this.yesNoPrtConfirm(msg);
            }
          },
          error => {
            console.log('error');
          }
        );
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
  * POPUPメッセージ 確認印刷最終メッセージはい、いいえ
  * はいの時、印刷処理を行う。(再度POPUPメッセージ「確認書をダウンロードします。」の後で...POPUP地獄)
  */
  public yesNoPrtConfirm(msg: Msg) {
    const dialogRef = this.popupAlertYesNoDialog.open(PopupAlertYesNoComponent, {
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
        // !dataがはい選択 
        if (!data) {
          let message = ['確認書をダウンロードします。'];
          const msg = {
            title: '',
            message: message,
          };
          this.printConfirm(msg);
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  確認書印刷最終POPUPメッセージ　非同期処理ゆえのPOPUP地獄
  *  ついに印刷処理（完結編)
  */
  public printConfirm(msg: Msg) {
    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
      restoreFocus: false,                                      // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      // autoFocus: false,                                      // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        // nullデータ戻りチェック必須（無いとプログラムエラー) OKボタンのみなのでここでは結果処理無視
        if (data) {
        }
        const kanri = new Kanri();
        kanri.shinseishaKaisha = this.kaisha;
        kanri.hokengaisha = this.loginUser.hokengaisha;
        this.kanriService.printHokenConfirm2(kanri)
        .then(res => {
            const hokenConfirmPdf = new Blob([res], { type: 'application/pdf' } );
            // ゲットしたBlobデータ(PDF)を別ウィンドウでダウンロードせず開く
            const url1 = URL.createObjectURL(hokenConfirmPdf);
            if (window.navigator.msSaveBlob) {
              saveAs(hokenConfirmPdf, 'hokenConfirm.pdf');          // IEの時はBlobデータが開けないのでダウンロードする(IE未推奨)
            } else {
              window.open(url1);
            }         
            this.getListByHokengaisha();                            // 書類一覧更新表示
          },
          error => {
            console.log('error print confirmSheet');
          }
        );
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  確認済みに戻すボタン
  *  印刷用ユーザーパスワード入力認証後、処理実行
  */
  public undoStatusToOk() {
    if (this.status.value !== String(Const.FRM_STATUS_END)) {
      let message = ['ステータス:印刷済分から選択してください。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }

    if (!this.selectedKanriList) {
      let message = ['戻す案件が選択されていません。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }
    // 認証ダイアログ表示
    const dialogRef = this.dialog.open(PwdUndoStatusToOkModalComponent, {
      data: 1,                        // モーダルコンポーネントにInjectするデータ 戻り処理用として設定
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後 Status:1確認済みに変更処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          const updateIds = [];
          this.selectedKanriList.forEach(kanri => {
            updateIds.push(kanri.id);
          });
          const requestDto = new RequestDto();
          requestDto.paramLongs = updateIds;
          this.kanriService.undoStatusToOk(requestDto)
          .then(res => {
            this.getListByHokengaisha();                            // 書類一覧更新表示
          },
          error => {
            console.log('error undoStatusToOk');
          });
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  未確認分に戻すボタン
  *  Status--->0、kakuninsha、saishu_kakuninbi、ok_shorui_ichiran、fubi_shorui_ichiran、hoken_bikou --->空文字
  */
  public undoStatusToNot() {
    if (!this.selectedKanriList) {
      let message = ['戻す案件が選択されていません。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }
    // 認証ダイアログ表示
    const dialogRef = this.dialog.open(PwdUndoStatusToNotModalComponent, {
      data: 1,                        // モーダルコンポーネントにInjectするデータ 戻り処理用として設定
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後 未確認分に変更処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          const updateIds = [];
          this.selectedKanriList.forEach(kanri => {
            updateIds.push(kanri.id);
          });
          const requestDto = new RequestDto();
          requestDto.paramLongs = updateIds;
          this.kanriService.undoStatusToNot(requestDto)
          .then(res => {
            this.getListByHokengaisha();                            // 書類一覧更新表示
          },
          error => {
            console.log('error undoStatusToOk');
          });
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  再印刷ボタン処理
  *
  */
  public rePrintConfirm() {
    if (this.status.value !== String(Const.FRM_STATUS_END)) {
      let message = ['印刷済分を選択してください。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }

    if (!this.selectedKanriList) {
      let message = ['再印刷書類が選択されていません。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }
    /* 複数選択可能とする
    if (this.selectedKanriList.length > 1) {
      let message = ['複数選択はできません。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }
    */
        
    
    // 認証ダイアログ表示
    const dialogRef = this.dialog.open(PwdReprtConfirmModalComponent, {
      data: 1,                        // モーダルコンポーネントにInjectするデータ 戻り処理用として設定
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
    });
    // 認証ダイアログ終了後、認証OKなら(data戻りが1)再印刷処理実行
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          //再印刷処理開始
          //const kanri = this.selectedKanriList[0];
          const reprintIds = [];
          this.selectedKanriList.forEach(kanri => {
            reprintIds.push(kanri.id);
          });
          const requestDto = new RequestDto();
          requestDto.paramLongs = reprintIds;
          //this.kanriService.rePrintHokenConfirm(kanri)
          this.kanriService.rePrintHokenConfirm(requestDto)
          .then(res => {
              const hokenConfirmPdf = new Blob([res], { type: 'application/pdf' } );
              // ゲットしたBlobデータ(PDF)を別ウィンドウでダウンロードせず開く
              const url1 = URL.createObjectURL(hokenConfirmPdf);
              if (window.navigator.msSaveBlob) {
                saveAs(hokenConfirmPdf, 'hokenConfirm.pdf');          // IEの時はBlobデータが開けないのでダウンロードする(IE未推奨)
              } else {
                window.open(url1);
              }         
              this.getListByHokengaisha();                            // 書類一覧更新表示
            },
            error => {
              console.log('error print reprint confirmSheet');
            }
          );
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  終了ボタン
  *  保険会社JLXログインへ移動
  */
  public logout() {
    if (this.kaisha === Const.JLX_HOKEN) {
      this.router.navigate(['/login-ins-jlx']);
    } else {
      this.router.navigate(['/login-ins-jlxhs']);
    }
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

