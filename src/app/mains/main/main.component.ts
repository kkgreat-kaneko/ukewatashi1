import { Component, ViewChild, OnInit } from '@angular/core';
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
import { KanriTableService } from '../../service/kanri-table.service';
import { KanriDelService } from '../../service/kanri-del.service';
import { DataCreateModalComponent } from '../data-create-modal/data-create-modal.component';
import { DataEditModalComponent } from '../data-edit-modal/data-edit-modal.component';
import { DataDeleteModalComponent } from '../data-delete-modal/data-delete-modal.component';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { DataApproveMultiModalComponent } from '../data-approve-multi-modal/data-approve-multi-modal.component';
import { DataApproveSingleModalComponent } from '../data-approve-single-modal/data-approve-single-modal.component';
import { DataPrintModalComponent } from '../data-print-modal/data-print-modal.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  message: string;                // 未使用 エラーメッセージ用
  loginUser = new Tantousha();    // ログインユーザー情報用
  admin = Const.KENGEN_ALL;       // 権限レベル
  manager = Const.KENGEN_MANAGER;
  normal = Const.KENGEN_NORMAL;

  displayColumns = [            // データテーブル列要素指定
    'select', 'status', 'statusApp', 'id', 'tantousha', 'shinseisha', 'sakuseibi', 'dlvry',
    'hokengaisha', 'seihobun', 'hokenTantou', 'shoukenbango', 'keiyakusha', 'kubun',
    'shoruiMaisu', 'bikou', 'hokenBikou', 'saishuHenshubi', 'kakuninsha', 'kakuninbi',
    'shouninsha', 'shouninbi', 'mishouninsha', 'mishouninbi', 'sakujyosha', 'sakujyoriyu'
  ];

  dataSource: MatTableDataSource<Kanri>;  // データテーブル
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator; // データテーブルページネーター参照変数 ページ送り部品
  @ViewChild(MatSort, {static: true}) sort: MatSort;                // テーブルソート
  /*
  *  データテーブルチェックボックス選択コレクションオブジェクト
  *  選択状態自体を管理する
  *  第1引数--->true: 複数選択可、false: 単一選択 切替可能
  *  複数選択可能とする ngOnInit内で権限別に初期化---> 管理者・所属長：複数選択可、一般：単一選択
  */
  // selection = new SelectionModel<Kanri>(true, []);
  selection: any;
  /*
  * セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  selection
  *  ngOninit処理でsubscribe
  */
  // private cbEmmiter = this.selection.onChange.asObservable();
  private cbEmmiter: any;
  // 新規編集用管理データ格納用
  dialogKanri: Kanri;
  // Status絞込み、承認Status絞込み、条件検索フォーム関連
  statusFormGroup: FormGroup;
  kanri: Kanri;
  jlx = Const.JLX_HOKEN;
  jlxhs = Const.JLX_HS_HOKEN;
  selectDetails = Const.SELECT_DETAILS;
  filterValues: any;                      // 書類検索条件用フィルター変数

  statusAppOk = Const.APP_STATUS_OK;      // HTML承認ステータス表示変換用 「済/未」表示変換

  /*
  * 所属員データ閲覧用
  */
 bushoDataViewMode = false;
 bushoBtnColorClass: any;                 // CSS STYLE用変数　選択・未選択状態を表示

  /*
  * 削除データ閲覧用
  */
  deletedKanriViewMode = false;
  btnColorClass: any;

  checkSheetData: Kanri[];                   // チェックシート印刷データ用

  constructor(private kanriService: KanriService, private kanriTableService: KanriTableService,
              private sessionService: SessionService, private dialog: MatDialog,
              private popupAlertDialog: MatDialog, private kanriDelService: KanriDelService,
              private router: Router,
            ) { }

  /*
  *   フォームコントローラー作成登録、データーテーブル初期化、
  *   データテーブルチェックボックスセレクtションイベント初期化
  *   ＊＊＊権限による設定未開発 管理者権限モードで開発中 ＊＊＊
  */
  ngOnInit() {
    this.loginUser = this.sessionService.setLoginUser();
    /*verify test*/ // console.log(this.loginUser);
    /*
    * 一覧の複数選択と単一選択可能を権限別に設定、選択時changeイベント登録
    */
    if (this.loginUser.kengen === Const.KENGEN_NORMAL) {
      this.selection = new SelectionModel<Kanri>(false, []);
    } else {
      this.selection = new SelectionModel<Kanri>(true, []);
    }
    this.cbEmmiter = this.selection.onChange.asObservable();

    this.statusFormGroup = new FormGroup({
      status: new FormControl('4'),
      beforeKanriNo: new FormControl(''),
      limit: new FormControl('1000'),
      statusApp: new FormControl('3'),
      shinseishaKaisha: new FormControl(''),
      detail1Item: new FormControl(''),
      detail2Item: new FormControl(''),
      detail3Item: new FormControl(''),
      detail1Value: new FormControl(''),
      detail2Value: new FormControl(''),
      detail3Value: new FormControl(''),
      printKanriId: new FormControl(''),
    });

    this.getInitList(); // 管理データ初期化 担当者申請者のデータは初回固定条件

    /*
    *  checkBoxのselected契機で受渡書類一覧テーブルの選択データを保持する。KanriTableServiceに選択されたselectItemを登録
    *  KanriTableServiceが編集・削除・承認などのボタンから利用される
    *  選択、選択解除によってデータ保持リセット行う
    *  複数選択可能なので、単一処理用と複数処理用にKanriTableサービスで保持している選択データ単一用、複数用(配列)にセット、解除する処理
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.kanriTableService.selected(cb.source.selected[0]);
        this.kanriTableService.selectedAll(cb.source.selected);
      } else {
        this.kanriTableService.deSelected();
        this.kanriTableService.deSelectedAll();
      }
    });

    /*
    * 所属員データ閲覧ボタン背景色動的変更用NgClass初期化
    */
   this.bushoBtnColorClass = {
    'active-btn': false,
    'non-active-btn': true,
    };

    /*
    * 削除データ閲覧ボタン背景色動的変更用NgClass初期化
    */
    this.btnColorClass = {
      'active-btn': false,
      'non-active-btn': true,
      };
  }

  /*
  *  テーブルデータ初期化,初回検索条件固定
  */
  public getInitList() {
    this.setKanri();
    this.kanriService.getInitList(this.kanri)
    .then(res => {
      this.dataSource = new MatTableDataSource<Kanri>(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
  * 通常データの検索、データテーブルへセット処理
  * setKanri処理でフォーム上の検索条件がKanriクラスに検索用プロパティをセットしPOSTデータ作成
  * KanriServiceよりJAX-RSと通信
  */
  public getList() {
    this.setKanri();
    this.kanriService.getList(this.kanri)
    .then(res => {
      // 選択状態のクリア必要(データテーブル再セット後、不具合となる為)
      this.selection.clear();
      this.dataSource = new MatTableDataSource<Kanri>(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
  * 削除閲覧モードON/OFFによって、通常データと削除データの検索リストセット処理を
  * 切り替えるファンクション
  * Status絞込み、承認Status絞込み、JLX/JLXHSボタンの選択イベントでコールされる
  * HTMLイベントコールに設定
  * 削除データ閲覧ボタン、クリアボタンでコールされる
  */
  public switchGetList() {
    if (this.deletedKanriViewMode) {
      this.getDeletedList();
    } else {
      this.getList();
    }
  }


  /*
  *  新規ボタン 書類データ登録モーダルダイアログオープン
  *
  */
  public createKanri() {
    this.dialogKanri = new Kanri();
    const dialogRef = this.dialog.open(DataCreateModalComponent, {
      data: this.dialogKanri,                       // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
      disableClose: true,                           // モーダル外クリック時モーダル画面を閉じる機能無効
      restoreFocus: false,                          // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,                             // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          this.getList();
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  編集ボタン処理
  *  書類受渡一覧が選択されている時、選択レコード内容の編集モーダル画面を開く
  *  承認済み書類は編集不可（承認戻し必要)メッセージダイアログ
  *  書類ステータス(郵送-1,受渡前0,書類不備3)のみ編集可能
  */
  public editKanri() {
    const selected = this.kanriTableService.getSelected();
    // 編集可能書類ステータス Array find処理がなぜか数値では使用できないので文字列に変換している
    const statuses = [Const.STATUS_DLVRY.toString(), Const.STATUS_NOT_CHECK.toString(), Const.STATUS_NG.toString()];

    // リスト未選択で編集ボタンクリック時
    if (!selected) {
      const msg1 = {
        title: 'メッセージ',
        message: '編集対象を選択してください。'
      };
      this.showAlert(msg1);
      return 0;
    }

    // 書類ステータスが編集可能条件不一致
    if ( !statuses.find(element => element === selected.status.toString()) ) {
      const msg2 = {
        title: 'メッセージ',
        message: '編集が可能な対象はStatus -1、0、3 の案件だけです。'
      };
      this.showAlert(msg2);
      return 0;
    }

    // 書類承認ステータス＝承認済み 編集不可
    if (selected.statusApp === Const.APP_STATUS_OK) {
      const msg2 = {
        title: 'メッセージ',
        message: '承認済みの案件は編集できません。'
      };
      this.showAlert(msg2);
      return 0;
    }


    this.dialogKanri = new Kanri();
    const dialogRef = this.dialog.open(DataEditModalComponent, {
      data: this.dialogKanri,                                     // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
      disableClose: true,                                         // モーダル外クリック時モーダル画面を閉じる機能無効
      restoreFocus: false,                                        // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,                                           // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
      .subscribe(
        data => {
          if (data) {
            this.getList();                                       // 書類一覧更新表示
          }
      },
      error => {
        console.log('error');
      }
    );

  }

  /*
  * 削除ボタン処理
  * 削除画面開く条件：書類選択必須として、status0、3の書類選択のみ可能
  */
  public deleteKanri() {
    const selected = this.kanriTableService.getSelected();

    if (selected) {
      if (selected.status !== Const.STATUS_NOT_CHECK && selected.status !== Const.STATUS_NG) {
        const msg = {
          title: 'メッセージ',
          message: '削除が可能な対象はstatusが0か3の案件です。'
        };
        this.showAlert(msg);
        return 0;
      }
      this.dialogKanri = new Kanri();
      const dialogRef = this.dialog.open(DataDeleteModalComponent, {
        data: this.dialogKanri,         // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
        disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
        restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
        autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
      });
      // ダイアログ終了後処理
      dialogRef.afterClosed()
      .subscribe(
        data => {
          if (data) {
            this.getList();             // 書類一覧更新表示
          }
        },
        error => {
          console.log('error');
        }
      );
    } else {                            // 一覧を未選択の時
      const msg = {
        title: 'メッセージ',
        message: '削除対象を選択して下さい。'
      };
      this.showAlert(msg);
    }

  }

  /*
  * 警告メッセージ
  * 削除ボタン(データ未選択時、Status0,3以外データ選択時)
  */
  public showAlert(msg: Msg) {
    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
      restoreFocus: false,                  // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      // autoFocus: false,                     // ダイアログ開いた時の自動フォーカス無効
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

  /*
  * 所属員データ閲覧ボタン
  * 閲覧モードによって新規編集削除承認ボタンdisabled状態、通常書類データリスト再表示や
  * 書類データ一覧の条件切替（通常閲覧検索、所属員データ閲覧検索）を行う
  * bushoDataViewMode = true 閲覧モードONの時、getBushoKanriList()を呼び出し
  * OFFの時、通常リストgetList()呼び出し
  */
 public showBushoData() {
  this.bushoDataViewMode = !this.bushoDataViewMode;                                     // 所属員データ閲覧モードセット
  this.bushoBtnColorClass['active-btn'] = !this.bushoBtnColorClass['active-btn'];
  this.bushoBtnColorClass['non-active-btn'] = !this.bushoBtnColorClass['non-active-btn'];
  this.switchGetList();　// 所属員データor本人データ 通常データと削除データの切り替え
}

  /*
  * 削除データ閲覧ボタン
  * 閲覧モードによって新規編集削除承認ボタンdisabled状態、通常書類データリスト再表示や
  * 検索絞込みの条件切替（通常閲覧検索、削除閲覧検索）を行う
  * deletedKanriViewMode = true 閲覧モードONの時、getDeletedList()を呼び出し
  * OFFの時、通常リストgetList()呼び出し
  */
  public showDeletedKanri() {
      this.deletedKanriViewMode = !this.deletedKanriViewMode;                                     // 削除データ閲覧モードセット
      // this.deletedKanriViewColor = this.deletedKanriViewColor === 'white' ? 'accent' : 'white';   // 削除閲覧データボタン背景色セット
      this.btnColorClass['active-btn'] = !this.btnColorClass['active-btn'];
      this.btnColorClass['non-active-btn'] = !this.btnColorClass['non-active-btn'];
      this.switchGetList();
  }

  /*
  * 削除データ検索、データテーブルへセットしリスト表示する処理
  * 削除データ閲覧モードONの時
  * 削除データ閲覧ボタンと条件絞込みのイベント処理内でコールされる
  */
  public getDeletedList() {
    this.setKanri();
    this.kanriDelService.getList(this.kanri)
    .then(res => {
      // 選択状態のクリア必要(データテーブル再セット後、不具合となる為)
      this.selection.clear();
      this.dataSource = new MatTableDataSource<Kanri>(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
  *  承認ボタン処理
  *  承認、承認戻し機能
  *  リスト未選択時警告メッセージ
  *  リスト複数選択status混在時警告メッセージ
  *  複数選択処理と単一選択処理にてダイアログ分岐
  *  未承認--->statsApp=10セット、承認済み statusApp=0にセット
  *  最終更新日をリセット
  */
  public approveKanri() {
    const selecteds = this.kanriTableService.getSelectedAll();
    // リスト未選択で編集ボタンクリック時
    if (!selecteds) {
      const msg1 = {
        title: 'メッセージ',
        message: '承認対象を選択してください。'
      };
      this.showAlert(msg1);
      return 0;
    }

    // リスト選択内容が未承認と承認済みが混在している時
    const appNotIds: number[] = [];
    const appOkIds: number[] = [];
    Object.keys(selecteds).forEach( key => {
        if (selecteds[key].statusApp === Const.APP_STATUS_NOT) {
          appNotIds.push(selecteds[key].id);
        } else {
          appOkIds.push(selecteds[key].id);
        }
    });
    if (Object.keys(selecteds).length !== appNotIds.length && Object.keys(selecteds).length !== appOkIds.length) {
      const msg1 = {
        title: 'メッセージ',
        message: '複数案件の「承認」または「未承認に戻す」を行う場合\nどちらかに統一して選択してください。'
      };
      this.showAlert(msg1);
      return 0;
    }

    // 複数選択 一括承認処理
    if (appNotIds.length > 1 || appOkIds.length > 1) {
      const appModeMulti = appNotIds.length > 1;
      const appDateMulti = this.sessionService.getToday();
      const appKanriesMulti: ApproveData = {
        setApprove: appModeMulti,
        kanriIds: appModeMulti ? appNotIds : appOkIds,
        shouninsha: this.loginUser.shimei,
        mishouninsha: this.loginUser.shimei,
        shouninbi: appDateMulti,
        mishouninbi: appDateMulti,
      };
      const dialogRef = this.dialog.open(DataApproveMultiModalComponent, {
        data: appKanriesMulti,          // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
        height: '200px',
        maxHeight: '200px',
        disableClose: true,             // モーダル外クリック時モーダル画面を閉じる機能無効
        restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
        autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
      });
      // ダイアログ終了後処理
      dialogRef.afterClosed()
      .subscribe(
        data => {
          if (data) {
            this.getList();
          }
        },
        error => {
          console.log('error');
        }
      );
      return;
    }

    // 単一承認選択の時処理
    const selectedKanri = this.kanriTableService.getSelected();
    const dialogRef = this.dialog.open(DataApproveSingleModalComponent, {
      data: selectedKanri,                // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
      disableClose: true,                 // モーダル外クリック時モーダル画面を閉じる機能無効
      width: '1250px',
      maxWidth: '1300px',                 //  最大幅がデフォルト設定あるので、変更必要
      restoreFocus: false,                // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,                   // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理 リスト再表示
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          this.getList();
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * チェックシート印刷ボタン処理
  *
  */
  public checkSheetPrint() {
    this.dialogKanri = new Kanri();
    this.dialogKanri.tantoushaUserId = this.loginUser.userId;
    if (!this.statusFormGroup.value.printKanriId) {
      this.dialogKanri.id = 1;
    } else {
      this.dialogKanri.id = this.statusFormGroup.value.printKanriId;
    }

    this.kanriService.checkSheetPrintInit(this.dialogKanri)
    .then(res => {
      this.checkSheetData = res;
      /*
      * ダイアログ表示 Injectデータを渡すには非同期処理のthen内で実行が必要
      */
      const dialogRef = this.dialog.open(DataPrintModalComponent, {
        data: this.checkSheetData,                    // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
        disableClose: true,                           // モーダル外クリック時モーダル画面を閉じる機能無効
        width: '1250px',
        maxWidth: '1300px',                           //  最大幅がデフォルト設定あるので、変更必要
        minHeight: '550px',                           // 最小高さ
        maxHeight: '600px',                           // 最大高さ mat-dialog-content min-height,max-heightと合わせて調整必要
        panelClass: 'myprint-dialog-panel',           // カスタマイズスタイルクラス style.cssに設定　背景色用
        autoFocus: false,                             // ダイアログ開いた後のボタン等への自動フォーカス無効
        restoreFocus: false,                          // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      });
      // ダイアログ終了後処理
      dialogRef.afterClosed()
        .subscribe(
          data => {
            if (data) {
              this.getList();                          // 書類一覧更新表示
            }
        },
        error => {
          console.log('error');
        }
      );

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
  *  検索条件選択処理--->データテーブル内のフィルター処理
  *  MatTableDataSourceのフィルター実行
  */
  public searchDetails() {
    this.setDetailKanri();
    this.dataSource.filterPredicate = this.customFilterPredicate;
    this.dataSource.filter = this.filterValues;
  }

  /*
  *  MatTableDataSource 列ごとにフィルターする為にカスタマイズした関数
  *  filterPredicateにセットしてカスタマイズする
  *  セットするデータ-->インターフェイスDatailsFilterの配列型
  *  配列ループ処理を行い、column=列名がvalue=列データに一致していればtrueを返す
  *  全部trueならフィルターされたデータが表示される
  *  [{column: 'shinseisha', value: '管理者'}, {column: 'hokengaisha', value: 'AFLAC'}];
  */
  private customFilterPredicate(data: Kanri, filter: any): boolean {
    let fitsThisFilter: boolean;
    for ( const elem of filter) {
      if (elem.column === 'id') {
        fitsThisFilter = data.id
        .toString()
        .toLowerCase()
        .startsWith(elem.value.trim().toLowerCase());
      } else {
        /* データにNULLが含まれるtrimエラーとなる
        *  保険担当者を登録なしにするとnullとなる
        */
        if (data[elem.column] == null ) {
          data[elem.column] = '';
        }
        fitsThisFilter = data[elem.column]
        .trim()
        .toLowerCase()
        .includes(elem.value.trim().toLowerCase());
      }
      if (!fitsThisFilter) {
        return false;
      }
    }
    return true;
  }

  /*
  *  Status絞込み 承認Status絞込み JLX/JLXHSボタン 所属員データボタンの選択値をセット
  */
  private setKanri() {
    this.kanri = new Kanri();
    this.kanri.userId = sessionStorage.getItem('userId');                   // UserID
    this.kanri.kengen = Number(sessionStorage.getItem('kengen'));           // 権限
    this.kanri.status = this.statusFormGroup.value.status;                  // status
    this.kanri.limit = this.statusFormGroup.value.limit;                    // 表示件数
    this.kanri.statusApp = this.statusFormGroup.value.statusApp;            // 承認Status
    // 管理No以前
    if (this.statusFormGroup.value.beforeKanriNo) {
      this.kanri.beforeId = this.statusFormGroup.value.beforeKanriNo;
    }
    // 会社選択 JLX/JLXHSボタン選択値を配列でセット (どちらか１つ選択もしくは２つとも選択)
    if (this.statusFormGroup.value.shinseishaKaisha) {
      this.kanri.sKaisha = this.statusFormGroup.value.shinseishaKaisha;
    }
    // 所属員データ選択 選択未選択モードより判別（所属長のみボタン表示あり)
    if (this.bushoDataViewMode) {
      this.kanri.tantoushaKaisha = sessionStorage.getItem('kaisha');        // 会社
      this.kanri.tantoushaTeam = sessionStorage.getItem('busho');           // 部署
      this.kanri.sBusho = this.bushoDataViewMode;
    }
  }

  /*
  * 検索条件をフィルターへ渡す値をセット
  * MatTableDataSourceのフィルターセット
  * 検索実行ボタンがクリックされた時、setKanri処理の後に検索条件を別途セット
  * フィルター初期化
  */
  private setDetailKanri() {
    this.filterValues = [];
    // 検索項目1 検索値 セット 項目と値がセット入力あればフィルターに追加
    if (this.statusFormGroup.value.detail1Item && this.statusFormGroup.value.detail1Value) {
      if (this.statusFormGroup.value.detail1Item === 'id' &&
            isNaN(this.statusFormGroup.value.detail1Value)  ) {
              // スキップ数値出ない時
            } else {
              this.filterValues.push(
                {column: this.statusFormGroup.value.detail1Item, value: this.statusFormGroup.value.detail1Value}
              );
            }
    }
    // 検索項目2 検索値 セット
    if (this.statusFormGroup.value.detail2Item && this.statusFormGroup.value.detail2Value) {
      if (this.statusFormGroup.value.detail2Item === 'id' &&
            isNaN(this.statusFormGroup.value.detail2Value)  ) {
              // スキップ 管理Noの入力が数値でない時
            } else {
              this.filterValues.push(
                {column: this.statusFormGroup.value.detail2Item, value: this.statusFormGroup.value.detail2Value}
              );
            }
    }
    // 検索項目3 検索値 セット
    if (this.statusFormGroup.value.detail3Item && this.statusFormGroup.value.detail3Value) {
      if (this.statusFormGroup.value.detail3Item === 'id' &&
            isNaN(this.statusFormGroup.value.detail3Value)  ) {
              // スキップ数値出ない時
            } else {
              this.filterValues.push(
                {column: this.statusFormGroup.value.detail3Item, value: this.statusFormGroup.value.detail3Value}
              );
            }
    }
  }

  /*
  *   検索条件の入力クリアボタン
  *   削除閲覧モードON/OFFによってリスト再表示を通常データと削除データで切替
  */
  public clearDetails() {
    // 検索項目１ー３
    this.detail1Item.reset();
    this.detail1Value.reset();
    this.detail2Item.reset();
    this.detail2Value.reset();
    this.detail3Item.reset();
    this.detail3Value.reset();
    // 削除データ閲覧モードON/OFFによってリスト再表示通常データと削除データの切替
    this.switchGetList();
  }
  /*
  * 検索条件項目1-3のゲッターセッター
  */
  get detail1Item() { return this.statusFormGroup.get('detail1Item'); }
  get detail1Value() { return this.statusFormGroup.get('detail1Value'); }
  get detail2Item() { return this.statusFormGroup.get('detail2Item'); }
  get detail2Value() { return this.statusFormGroup.get('detail2Value'); }
  get detail3Item() { return this.statusFormGroup.get('detail3Item'); }
  get detail3Value() { return this.statusFormGroup.get('detail3Value'); }

  /*
  *  ログアウトボタン
  *  ルートパスへ移動（ログイン画面)
  */
  public logout() {
    this.router.navigate(['/']);
  }

  /*
  *  メンテナンスボタン
  *  メンテナンスコンポーネント開く
  */
  public showMaintenance() {
    this.router.navigate(['/maintenance']);
  }

}

/* --------------------------------------------------------------------------------- */
/*
*  POPUPダイアログメッセージ用インターフェイス
*/
export interface Msg {
  title: string;          // ダイアログタイトル名をセット
  message: string;        // ダイアログメッセージをセット
}

/*
*  承認・未承認データ用インターフェイス
*
*/
export interface ApproveData {
  setApprove: boolean;      // 承認モード:true・未承認モード:falseの判別フラグセット
  kanriIds: number[];       // 対象書類データのIDをセット
  shouninsha: string;       // 承認者
  shouninbi: string;        // 承認日
  mishouninsha: string;     // 未承認者
  mishouninbi: string;      // 未承認日
  // saishuHenshubi: string;   // 最終編集日
}
