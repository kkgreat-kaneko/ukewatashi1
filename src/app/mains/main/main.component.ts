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
import { PasswordChangeModalComponent } from '../password-change-modal/password-change-modal.component';


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
  initMsg: string[];              // ログイン後チェック用メッセージ

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

  /*
  * フォームコントーロラー初期化　（値セットするフォーム必要分だけ)
  * statusフォームクラス初期化 イニシャライズ処理内の不備書類チェックでデフォルト値4未確認すべて <---> 5不備書類 処理の為インスタンス化
  */
  status = new FormControl('4');                    // status絞込み
  beforeKanriNo = new FormControl('');              // 管理No.以前
  limit = new FormControl('1000');                  // 表示件数1000デフォルト値
  statusApp = new FormControl('3');                 // 承認ステータスデフォルトすべて
  shinseishaKaisha = new FormControl('');           // JLX/JLXHS　会社選択ボタン


  constructor(private kanriService: KanriService, private kanriTableService: KanriTableService,
              private sessionService: SessionService, private dialog: MatDialog,
              private popupAlertDialog: MatDialog, private kanriDelService: KanriDelService,
              private router: Router,
            ) { }

  /*
  *   初期化処理
  *   1.フォームコントローラー作成登録
  *   2.データテーブル選択チェックボックス セレクトションイベント初期化
  *   3.所属員閲覧ボタン(所属長のみ)のON/OFF用フラグ設定
  *   4.削除閲覧ボタンのON/OFF用フラグ設定
  *   5.初期化分岐パターンとして、ログイン後の初期化とメンテナンス画面遷移からの戻り初期化処理の
  *     ２パターンがある。
  *   6.パターン1(ログイン後初期化処理)initList()
  *     A:不備書類チェック処理 不備有は検索絞込みを不備書類選択状態にセット、無しは未選択すべてにセットする
  *       getInitChkFubi
  *     B:書類チェック処理し結果有はMSG変数にメッセージ代入(代入まで)
  *       パスワード有効期限チェック処理 期限切れの時、メッセージダイアログ後パスワード変更ダイアログに遷移
  *       PWDチェック完了後、書類チェックメッセージ(有れば)出力
  *     C：書類一覧検索処理 getInitList
  *       statusのみ変動値；不備書類チェックにて分岐 status:0未確認すべて　もしくは　3不備書類の検索条件となる
  *   7.パターン2(メンテナンス画面戻り処理)　画面遷移の為ngOnInitを通過してしまう。
  *     A:SessionStorage保存されたメンテナンスモードフラグを読み取り、ログイン後ORメンテナンス戻り？を判別している
  *     B:さらに通常の書類一覧表示モードと削除閲覧モードを同じくSessionStorageより判別し、どちらの処理に分岐
  *     C:通常一覧表示処理 getList(1) SessionStorageに保存された条件絞込み選択状態を復元して、一覧の出力を復元
  *     D:削除閲覧一覧表示処理 getDeletedList(1) SessionStorageに保存された条件絞込み選択状態を復元して、一覧の出力を復元
  *   
  */
  ngOnInit() {
    this.loginUser = this.sessionService.setLoginUser();
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
      status: this.status,                            // 未確認すべて:4 もしくは 不備書類:5
      beforeKanriNo: this.beforeKanriNo,              // 管理No.以前〜
      limit: this.limit,                              // 表示件数1000デフォルト値
      statusApp: this.statusApp,                      // 承認ステータスデフォルトすべて
      shinseishaKaisha: this.shinseishaKaisha,        // JLX/JLXHS 会社選択ボタン
      detail1Item: new FormControl(''),
      detail2Item: new FormControl(''),
      detail3Item: new FormControl(''),
      detail1Value: new FormControl(''),
      detail2Value: new FormControl(''),
      detail3Value: new FormControl(''),
      printKanriId: new FormControl(''),
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

    /*
    *  書類一覧表示するまでの処理を一括して行う。
    *  ログイン後の書類チェック処理、書類一覧作成処理、パスワード有効期限チェック処理
    *  書類データ初期化 担当者申請者のデータは初回未確定すべてOR不備書類のどちらかを出力
    *  メンテナンス画面から戻りの場合、ngOnInitに戻るので、
    *  その場合sessionStorageアイテムmaintenanceMode=1で判別して処理を分ける
    *  通常初期化(ログイン直後)---------> パスワード有効期限チェック、ログイン後書類チェックからの書類一覧出力
    *  メンテナンスモード--------------> メンテナンス遷移前のStatus絞込み状態を保持復元して書類一覧出力 削除閲覧と通常一覧出力とで遷移前状態がどちらかによって分岐する
    */
    this.initMsg = [];
    if (sessionStorage.getItem('maintenanceMode')) {      // メンテナンス画面戻りの時
      if(sessionStorage.getItem('deletedKanriViewMode')) {// メンテナンス遷移前が削除閲覧状態だった時
        this.getDeletedList(1);                           // 引数1を渡すとメンテナンス遷移前状態に復元して削除閲覧リストを出力する
      } else {
        this.getList(1);                                  // 引数1を渡すとメンテナンス遷移前状態に復元して通常書類リストを出力する
      }
      sessionStorage.removeItem('maintenanceMode');       // メンテナンスモードから戻り処理完了、初期化
    } else {
      this.initList();                                    // 通常ログイン後初期化処理　内部でgetList()引数なしを実行している
    }

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

  }

  /*
  *  イニシャライズチェック処理 ---> 書類一覧データ生成処理
  *  不備書類検索　あれば一覧status絞込みを不備書類にして出力処理に変更
  *  書類不備検索 条件：入力担当者＝ログインID
  */
  public initList() {
    this.setKanri();
    this.kanriService.getInitChkFubi(this.kanri)      // ログインID = 入力担当者に不備書類があるか検索
    .then(res => {
      if (res) {
        this.status.setValue('5');                    // status絞込みを不備書類にセット
      }
      this.getInitChkNotChk();                        // 書類不備がない場合、未確認受渡一覧を表示するメッセージ処理
      this.getInitList();                             // 管理データ初期化 担当者申請者のデータは初回固定条件 status絞込み 未確認すべてOR書類不備
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
  *  イニシャライズ処理initList内で使用　ログイン後チェック処理
  *  パスワード有効期限チェック、未確認受渡書類の有無　検索条件：入力担当者 = ログインID、status = 0、受渡方法 = 受渡
  *  非同期地獄の極み。。。
  */
  public getInitChkNotChk() {
    this.setKanri();
    this.kanriService.getInitChkNotChk(this.kanri)
    .then(res => {
      /* 書類チェック検索にある場合 メッセージ文言をセットする--->出力はパスワード処理*/
      if (res) {
        /* 不備書類がなく、未確認書類データが有れば、メッセージをセット */
        if (res.paramLongs[0]) {
          if (this.status.value === '4') {
            //this.initMsg = ['書類不備とされたケースはありません。', '保険会社側未確認分を表示します。'];
            this.initMsg.push('書類不備とされたケースはありません。');
            this.initMsg.push('保険会社側未確認分を表示します。');
          }
        }
        /* 不備書類有無にかかわらず郵送ケースが一致有れば、メッセージをセット */
        if (res.paramLongs[1]) {
          this.initMsg.push('郵送ケースで Status 0 のままデータが残っていますが');
          this.initMsg.push('チェックシート印刷を行えば Status -1 となり');
          this.initMsg.push('次回からは出なくなります。');
        }
      }
      /*
      *  パスワード有効期限チェック処理
      *  パスワード有効期限９０日超過時、パスワード変更ダイアログ開く。
      *　ダイアログの閉じるボタンは、変更完了までDisabled状態となる。
      *  パスワード変更処理後、書類チェックメッセージを出力（showPwdAlert内でコール)
      *  パスワード有効期限切れでなければ、書類チェックメッセージを出力
      */
      if (this.sessionService.getPwdExpired()) {
        let message = ['パスワードの有効期限が切れています。変更をお願いします。'];
        const msg = {
          title: '',
          message: message,
        };
        // パスワード変更用メッセージ出力関数 最終処理showInitAlertで書類チェックメッセージを出力して書類一覧出力初期化完了
        this.showPwdAlert(msg);
      } else {
        /* パスワード有効期限OK時は、書類チェックメッセージのみ出力 this.initMsgは設定済み
        *  不備書類データがある場合は、メッセージを出力しないパターンある為、initMsgを有無チェック
        *  showPwdBeforeExpiredAlert--->書類チェック結果メッセージ出力後にパスワード14日前チェック処理実行
        *  実行結果より、パスワード変更促す警告メッセージを出力する
        */
        if (this.initMsg.length > 0) {
          const msg = {
            title: '',
            message: this.initMsg,
          };
          this.showPwdBeforeExpiredAlert(msg);
        }
        
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
  * maintenanceMode--->メンテナンス画面からの戻り時、SessionStorageに保持したフォーム状態を復元してKanriクラスにセットする。
  * KanriServiceよりJAX-RSと通信
  */
  public getList(maintenanceMode = 0) {
    if (maintenanceMode) {
      this.setKanriMaintenanceMode();
    } else {
      this.setKanri();
    }
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
      let message = ['編集対象を選択してください。'];
      const msg1 = {
        title: '',
        message: message,
      };
      this.showAlert(msg1);
      return 0;
    }

    // 書類ステータスが編集可能条件不一致
    if ( !statuses.find(element => element === selected.status.toString()) ) {
      let message = ['編集が可能な対象はStatus -1、0、3 の案件だけです。'];
      const msg2 = {
        title: '',
        message: message,
      };
      this.showAlert(msg2);
      return 0;
    }

    // 書類承認ステータス＝承認済み 編集不可
    if (selected.statusApp === Const.APP_STATUS_OK) {
      let message = ['承認済みの案件は編集できません。'];
      const msg3 = {
        title: '',
        message: message,
      };
      this.showAlert(msg3);
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
    const selectedAll = this.kanriTableService.getSelectedAll();
    if (selectedAll) {
      if (selectedAll.length > 1) {
        let message = ['複数選択されています。一括削除はできません。'];
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }
    }

    const selected = this.kanriTableService.getSelected();
    if (selected) {
      if (selected.status !== Const.STATUS_NOT_CHECK && selected.status !== Const.STATUS_NG) {
        let message = ['削除が可能な対象はstatusが0か3の案件です。'];
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }
      this.dialogKanri = new Kanri();
      const dialogRef = this.dialog.open(DataDeleteModalComponent, {
        data: this.dialogKanri,         // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
        disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
        restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
        //autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効 *コメントアウト不備書類削除選択時、削除理由にフォーカス
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
      let message = ['削除対象を選択して下さい。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
    }

  }

  /*
  * 警告メッセージ
  * 削除ボタン(データ未選択時、Status0,3以外データ選択時)
  * 引数インターフィイスMsg　ソース最後に宣言
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
      this.btnColorClass['active-btn'] = !this.btnColorClass['active-btn'];
      this.btnColorClass['non-active-btn'] = !this.btnColorClass['non-active-btn'];
      this.switchGetList();
  }

  /*
  * 削除データ検索、データテーブルへセットしリスト表示する処理
  * 削除データ閲覧モードONの時
  * 削除データ閲覧ボタンと条件絞込みのイベント処理内でコールされる
  * maintenanceMode--->getListと同様メンテナンス画面遷移前の削除閲覧モード状態を復元する処理(悩ましい)
  */
  public getDeletedList(maintenanceMode = 0) {
    if (maintenanceMode) {
      this.setKanriMaintenanceMode();
    } else {
      this.setKanri();
    }
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
      let message = ['承認対象を選択してください。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
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
      let message = ['複数案件の「承認」または「未承認に戻す」を行う場合', 'どちらかに統一して選択してください。'];
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
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
    /*
    * チェックシート印刷データ検索
    * データをチェックシートダイアログにInjectionで渡す。並び替えはダイアログロジック処理
    * データなしの場合、メッセージ出力してメインに戻る
    */
    this.kanriService.checkSheetPrintInit(this.dialogKanri)
    .then(res => {
      if (res.length > 0) {
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
              }
              this.getList();                          // 書類一覧更新表示
          },
          error => {
            console.log('error');
          }
        );
      } else {
        const message = ['現在印刷する対象はありません。'];
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
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
  *  メンテナンスへページ遷移し戻ってきた時、メイン画面の検索選択状態を保持し遷移前状態の復元用--->setKanriMaintenanceMode()で復元
  *  ダイアログと違い画面が遷移戻りの場合は、フォーム状態は保持されない為、戻った時、ログイン後と同じ動きとなってしまう為、別処理が必要。
  *  Status絞込み 承認Status絞込み JLX/JLXHSボタン 所属員データボタンの選択値をSessionStorageに保存
  */
  private saveKanriMaintenanceMode() {
    // 初期化
    sessionStorage.removeItem('formStatus');
    sessionStorage.removeItem('formLimit');
    sessionStorage.removeItem('formStatusApp');
    sessionStorage.removeItem('formBeforeKanriNo');
    sessionStorage.removeItem('formShinseishaKaisha1');
    sessionStorage.removeItem('formShinseishaKaisha2');
    sessionStorage.removeItem('bushoDataViewMode');
    sessionStorage.removeItem('deletedKanriViewMode');

    sessionStorage.setItem('formStatus', this.statusFormGroup.value.status);              // status
    sessionStorage.setItem('formLimit', this.statusFormGroup.value.limit);                // 表示件数
    sessionStorage.setItem('formStatusApp', this.statusFormGroup.value.statusApp);        // 承認Status    
    // 管理No以前
    if (this.statusFormGroup.value.beforeKanriNo) {
      sessionStorage.setItem('formBeforeKanriNo', this.statusFormGroup.value.beforeKanriNo);  
    }
    // 会社選択 JLX/JLXHSボタン選択値をセット (どちらか１つ選択もしくは２つとも選択) SessionStorageは文字列のみセットなので配列値をそれぞれセット
    if (this.statusFormGroup.value.shinseishaKaisha) {
      if (this.statusFormGroup.value.shinseishaKaisha[0]) {
        sessionStorage.setItem('formShinseishaKaisha1', this.statusFormGroup.value.shinseishaKaisha[0]);
      }
      if (this.statusFormGroup.value.shinseishaKaisha[1]) {
        sessionStorage.setItem('formShinseishaKaisha2', this.statusFormGroup.value.shinseishaKaisha[1]);
      }
    }
    // 所属員データ選択 選択未選択モードより判別（所属長のみボタン表示あり)
    if (this.bushoDataViewMode) {
      sessionStorage.setItem('bushoDataViewMode', '1');                                       // boolean型はセットできない--->1代入
    }
    // 削除データ閲覧モード選択 MODE:TRUE-->閲覧ON
    if (this.deletedKanriViewMode) {
      sessionStorage.setItem('deletedKanriViewMode', '1');
    }
  }

  /*
  *  メンテナンス画面から戻った時、検索状態とその一覧を復元する為の処理
  *  バックエンドへ渡すkanriとViewフォーム値を復元セットする
  *  Status絞込み 承認Status絞込み JLX/JLXHSボタン 所属員データボタンの選択値をセット
  *  悩ましい。。。ダイアログにすれば苦労しないが。
  */
  private setKanriMaintenanceMode() {
    this.kanri = new Kanri();
    this.kanri.userId = sessionStorage.getItem('userId');                       // UserID
    this.kanri.kengen = Number(sessionStorage.getItem('kengen'));               // 権限
    this.kanri.status = Number(sessionStorage.getItem('formStatus'));           // status
    this.status.setValue(sessionStorage.getItem('formStatus'));
    this.kanri.limit = Number(sessionStorage.getItem('formLimit'));             // 表示件数
    this.limit.setValue(sessionStorage.getItem('formLimit'));
    this.kanri.statusApp = Number(sessionStorage.getItem('formStatusApp'));     // 承認Status
    this.statusApp.setValue(sessionStorage.getItem('formStatusApp'));
    // 管理No以前
    const beforeKanriNo = Number(sessionStorage.getItem('formBeforeKanriNo'));
    if (beforeKanriNo) {
      this.kanri.beforeId = beforeKanriNo;
      this.beforeKanriNo.setValue(sessionStorage.getItem('formBeforeKanriNo')); // 文字列セット
    }
    // 会社選択 JLX/JLXHSボタン選択値を配列でセット (どちらか１つ選択もしくは２つとも選択)
    const sKaisha: string[] = [];
    const shinseishaKaisha1 = sessionStorage.getItem('formShinseishaKaisha1');
    if (shinseishaKaisha1) {
      sKaisha.push(shinseishaKaisha1);
    }
    const shinseishaKaisha2 = sessionStorage.getItem('formShinseishaKaisha2');
    if (shinseishaKaisha2) {
      sKaisha.push(shinseishaKaisha2);
    }
    if (sKaisha.length > 0) {
      this.kanri.sKaisha = sKaisha;
      this.shinseishaKaisha.setValue(sKaisha);
    }
    // 所属員データ選択 選択未選択モードより判別（所属長のみボタン表示あり)
    const bushoDataViewMode = sessionStorage.getItem('bushoDataViewMode');
    if (bushoDataViewMode) {
      this.bushoDataViewMode = true;
      this.bushoBtnColorClass['active-btn'] = true;
      this.bushoBtnColorClass['non-active-btn'] = false;
      this.kanri.tantoushaKaisha = sessionStorage.getItem('kaisha');        // 会社
      this.kanri.tantoushaTeam = sessionStorage.getItem('busho');           // 部署
      this.kanri.sBusho = this.bushoDataViewMode;
    }

    // 削除閲覧選択 選択未選択モードより判別
    const deletedKanriViewMode = sessionStorage.getItem('deletedKanriViewMode');
    if (deletedKanriViewMode) {
      this.deletedKanriViewMode = true;                                     // 削除データ閲覧モードセット
      this.btnColorClass['active-btn'] = true;
      this.btnColorClass['non-active-btn'] = false;
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
    sessionStorage.setItem('maintenanceMode', '1');        // メンテナンスモードセット、メイン画面戻り時判別用
    this.saveKanriMaintenanceMode();
    this.router.navigate(['/maintenance']);
  }

  /*
  *  パスワード変更ボタン
  *  passwordChangeModalComponentを開く
  */
  public showPasswordChange(pwdExpired = false) {
    //this.daialogTantousha = new Tantousha();
    const daialogTantousha = new Tantousha();
    if (pwdExpired) {
      daialogTantousha.passwordSetdate = 'expired';
    }
    const dialogRef = this.dialog.open(PasswordChangeModalComponent, {
      data: daialogTantousha,    // モーダルコンポーネントにInjectするデータ 戻り処理ないがインスタンス渡し必要
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          this.sessionService.resetPwdExpired();
          let message = ['パスワードが変更されました。'];
          const msg = {
            title: '',
            message: message,
          };
          this.showInitAlert(msg);
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * パスワード有効期限切れメッセージ
  * 削除ボタン(データ未選択時、Status0,3以外データ選択時)
  */
  public showPwdAlert(msg: Msg) {
    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
      restoreFocus: false,                      // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      // autoFocus: false,                      // ダイアログ開いた時の自動フォーカス無効
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        // nullデータ戻りチェック必須（無いとプログラムエラー)---->OKで閉じるしかないのでデータなし
        if (data) {
        }
        // パスワード変更ダイアログ開く 引数にダイアログ閉じるボタンのDisabledフラグ
        this.showPasswordChange(true);
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * ログイン後書類チェック用メッセージ
  * initListをコール親として、パスワード変更チェック処理内showPasswordChangeから最終コールされる。（非同期処理により複雑にコールされている）
  * 最終処理として、パスワード変更完了メッセージの後にログイン後の書類チェック結果メッセージを出力して終了する。
  * 引数インターフィイスMsg　ソース最後に宣言
  */
  public showInitAlert(msg: Msg) {
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
        /* 書類チェック結果メッセージを出力する。（ログイン後書類一覧出力初期化の最終処理となる)
        *  不備書類がある場合、メッセージ出力しないパターンがある為、initMsgの有無をチェック
        */
        if (this.initMsg.length > 0) {
          const msg = {
            title: '',
            message: this.initMsg,
          };
          this.showAlert(msg);
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * パスワード有効期限14日前警告メッセージ
  * 書類チュック結果のメッセージ出力処理後、
  * 14日前チェック処理実行結果より、警告メッセージを出力する。
  */
  public showPwdBeforeExpiredAlert(msg: Msg) {
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
        /* SessionStorageの14日前フラグセット状態よりメッセージ処理
        *  パスワード変更促すメッセージ
        */
        if (this.sessionService.getPwdBeforeExpired()) {
          const message = ['パスワードの有効期限が近ついています。', '変更をお願いします。'];
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
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
