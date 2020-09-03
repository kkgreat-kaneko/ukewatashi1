import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { SessionService } from '../../service/session.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { Hokengaisha } from '../../class/hokengaisha';
import { HokengaishaService } from '../../service/hokengaisha.service';
import { HokengaishaList } from '../../class/hokengaisha-list';
import { HokengaishaListService } from '../../service/hokengaisha-list.service';

@Component({
  selector: 'app-mst-hokengaisha',
  templateUrl: './mst-hokengaisha.component.html',
  styleUrls: ['./mst-hokengaisha.component.css']
})
export class MstHokengaishaComponent implements OnInit {
  message: string;                                                      // システムエラーメッセージ
  errorUserIdMsg: string;                                               // ユーザーIDフォーム警告メッセージ
  errorPasswordMsg: string;                                             // パスワードフォーム警告メッセージ
  errorPwdSetDateMsg: string;                                           // パスワード設定日警告用エラーメッセージ
  selectedHokengaisha: Hokengaisha;                                     // 一覧選択データ用
  updateUserId: string;                                                 // 編集削除時ユーザーID変更入力したか判別用
  hokengaishaList: HokengaishaList[];                                   // 保険会社選択セレクトフォーム用
  
  displayColumns = [
    'select', 'userId', 'password', 'passwordSetdate', 'hokengaisha', 'seiho', 'kakuninsha',
    'yomi', 'busho'
  ];
  dataSource: MatTableDataSource<Hokengaisha>;                          // 保険会社担当一覧データソース
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;     // 一覧ページネーター参照変数 ページ送り部品
  @ViewChild(MatSort, {static: true}) sort: MatSort;                    // 一覧ソート
  selection = new SelectionModel<Hokengaisha>(false, []);               // 一覧選択クラス false設定は単一選択のみ(true複数選択可)
  /*
  *  セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  selection
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();

  formGroup: FormGroup;                                                  // フォームグループ、以下フォームコントロール初期化
  userId = new FormControl('', [Validators.required]);                   // ユーザーID
  password = new FormControl('');                                        // パスワード
  passwordSetdate = new FormControl('');                                 // パスワード設定日
  hokengaisha = new FormControl('', [Validators.required]);              // 保険会社名
  seiho = new FormControl('');                                           // 生保名
  kakuninsha = new FormControl('');                                      // 保険担当者名
  yomi = new FormControl('');                                            // 担当者読み仮名
  busho = new FormControl('');                                           // 担当者部署名


  constructor(private router: Router,
              private sessionService: SessionService,
              private hokengaishaService: HokengaishaService,
              private hokengaishaListService: HokengaishaListService,
              private fb: FormBuilder,
              private popupAlertDialog: MatDialog,
  ) { }

  ngOnInit() {
    /* ブラウザ戻るボタン禁止 */
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
      history.go(1);
    });
    
    this.setFormGroup();
    this.getHokenTantouAll();
    this.getHokengaishaList();
    /*
    *  checkBoxのselected契機で担当者一覧の選択データを保持する。selectedHokengaisha変数に選択されたselectItemを登録
    *  selectedHokengaisha変数が編集・削除のボタンから利用される
    *  選択、選択解除によってデータ保持リセット行う
    *  一覧は単一選択のみ可、selectedHokengaisha変数にセットされれた選択データ単一用、解除する処理
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.selectedHokengaisha = cb.source.selected[0];
        this.userId.setValue(this.selectedHokengaisha.userId);
        this.password.setValue(this.selectedHokengaisha.password);
        this.passwordSetdate.setValue(this.selectedHokengaisha.passwordSetdate);
        this.hokengaisha.setValue(this.selectedHokengaisha.hokengaisha);
        this.seiho.setValue(this.selectedHokengaisha.seiho);
        this.kakuninsha.setValue(this.selectedHokengaisha.kakuninsha);
        this.yomi.setValue(this.selectedHokengaisha.yomi);
        this.busho.setValue(this.selectedHokengaisha.busho);
        this.updateUserId = this.selectedHokengaisha.userId;
      } else {
        this.selectedHokengaisha = null;
        this.updateUserId = null;
        this.formGroup.reset();
      }
    });
  }

  /*
  * フォームグループセット処理
  */
  public setFormGroup() {
    this.formGroup = this.fb.group({                          // フォームグループ初期化
      userId: this.userId,                                    // ユーザーIDフォーム
      password: this.password,                                // パスワード
      passwordSetdate: this.passwordSetdate,                  // パスワード設定日
      hokengaisha: this.hokengaisha,                          // 保険会社名
      seiho: this.seiho,                                      // 生保名
      kakuninsha: this.kakuninsha,                            // 保険会社担当者名
      yomi: this.yomi,                                        // 保険会社担当者読み
      busho: this.busho                                       // 担当者部署名
    });
  }

  /*
  *  保険会社担当者データ一覧処理
  *  一覧ソースdataSourceをリセット
  */
  public getHokenTantouAll() {
    this.hokengaishaService.getHokenTantouAll()
    .then(res => {
      this.dataSource = new MatTableDataSource<Hokengaisha>(res);
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
  *  保険会社セレクト用データ取得
  *  全保険会社検索をバックエンドと通信
  *  
  */
  public getHokengaishaList() {
    this.hokengaishaListService.getAllList()
    .then(res => {
      this.hokengaishaList = res;
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
  *  登録実行ボタン
  */
  public create() {
    let userId = this.formGroup.value.userId;
    if (!userId) {
      const message = ['ユーザーIDは、必ず入力してください。']
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }

    let hokengaisha = this.formGroup.value.hokengaisha;                                         // 保険会社必須項目
    if (!hokengaisha) {
      const message = ['会社名を選択してください。']
      const msg = {
        title: '',
        message: message,
      };
      this.showAlert(msg);
      return 0;
    }

    // DB検索処理 user_idの重複チェック--->OKならDB登録処理
    this.hokengaishaService.getByID(userId)
    .then(res => {
      if (res) {
        const message = ['ユーザーID: ' + userId + ' は既に登録されています。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;                                                                               // MSG出力後、中断して戻る
      } else {
        this.selectedHokengaisha = new Hokengaisha();
        this.selectedHokengaisha.userId = userId;                                               // ユーザーID 入力制限英数一部記号のみ 16文字以内
        this.selectedHokengaisha.password = this.formGroup.value.password;                      // パスワード 入力制限英数一部記号のみ 16文字以内
        this.selectedHokengaisha.passwordSetdate = this.sessionService.getToday();              // 自動登録項目 フォーム入力不要
        this.selectedHokengaisha.hokengaisha = this.formGroup.value.hokengaisha;                // 保険会社 必須項目
        this.selectedHokengaisha.seiho = this.formGroup.value.seiho;                            // 生保
        this.selectedHokengaisha.kakuninsha = this.formGroup.value.kakuninsha;                  // 確認者(氏名)
        this.selectedHokengaisha.yomi = this.formGroup.value.yomi;                              // 読み(確認者氏名)
        this.selectedHokengaisha.busho = this.formGroup.value.busho;                            // 部署名
        
        // DB登録処理
        this.hokengaishaService.create(this.selectedHokengaisha)
        .then(res => {
          const message = ['ユーザーID: ' + res.userId + ', 確認者: ' + res.kakuninsha, 'を登録しました。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          this.clear();
        })
        .catch(err => {
          console.log(`login fail: ${err}`);
          this.message = 'データの取得に失敗しました。';
        })
        .then(() => {
          // anything finally method
        });
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
  *  更新ボタン
  */
  public update() {
    if (this.selectedHokengaisha) {
      if (this.formGroup.value.userId !== this.updateUserId) {
        const message = ['更新実行ではユーザーIDの変更はできません。', '「登録実行」してください。']      // 新仕様　更新実行時はユーザーIDの変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }

      // 新仕様--->パスワード設定日書式チェック
      const pattern = /^[1-2][0-9]{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1]) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      const chk = this.formGroup.value.passwordSetdate.match(pattern);
      if (!chk) {
        const message = [
          'パスワード設定日に誤りがあります。(書式、末日等)', 
          '書式は、「YYYY/MM/DD hh:mm:ss」 です。',
          '*日付と時間の間は半角スペース'
        ]
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }

      // 新仕様--->パスワード設定日付の有効性チェック(閏年、月末30日月)
      const strYMD = this.formGroup.value.passwordSetdate.substring(0, 10);
      const dateYMD = new Date(strYMD);
      const year = dateYMD.getFullYear();
      const month = String(dateYMD.getMonth()+1);
      const date = String(dateYMD.getDate());
      const chkYMD = year + "/" + this.toDoubleDigits(month) + "/" + this.toDoubleDigits(date);
      if (strYMD !== chkYMD) {
        const message = ['パスワード設定日が有効日付ではありません。(末日等)', '年月日を確認してください。'];
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }

      // 更新フォーム値セット userIdはそのまま
      this.selectedHokengaisha.password = this.formGroup.value.password;
      this.selectedHokengaisha.passwordSetdate = this.formGroup.value.passwordSetdate;
      this.selectedHokengaisha.hokengaisha = this.formGroup.value.hokengaisha;
      this.selectedHokengaisha.kakuninsha = this.formGroup.value.kakuninsha;
      this.selectedHokengaisha.yomi = this.formGroup.value.yomi;
      this.selectedHokengaisha.busho = this.formGroup.value.busho;
      // DB編集更新処理
      this.hokengaishaService.update(this.selectedHokengaisha)
      .then(res => {
        const message = ['ユーザーID: ' + res.userId + ', 確認者: ' + res.kakuninsha, 'を更新しました。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        this.clear();
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
    }
  }

  /*
  *  削除ボタン
  */
  public delete() {
    if (this.selectedHokengaisha) {
      if (this.formGroup.value.userId !== this.updateUserId) {
        const message = ['削除実行はユーザーIDの変更ができません。']                          // 新仕様　削除実行時はユーザーIDの変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }
      // DB削除処理
      this.hokengaishaService.delete(this.selectedHokengaisha.userId)
      .then(res => {
        if (res) {
          const message = ['ユーザーID: ' + this.selectedHokengaisha.userId + ' を削除しました。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          this.clear();
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
  }

  /*
  * 検索ボタン
  * ユーザーIDと確認者の部分一致検索
  * 3フォーム入力パターンの処理分岐 ユーザーIDのみ、氏名のみ、両方
  */
  public find() {
    const userId = this.formGroup.value.userId;
    const kakuninsha = this.formGroup.value.kakuninsha;
    if (userId && !kakuninsha) {
      const hokengaisha = new Hokengaisha();
      hokengaisha.userId = userId;
      // DB検索処理
      this.hokengaishaService.findLikeUserId(hokengaisha)
      .then(res => {
        // 検索データセット
        this.dataSource = new MatTableDataSource<Hokengaisha>(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // 一覧選択状態クリア
        this.selectedHokengaisha = null;
        this.updateUserId = null;
        this.selection.clear();
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
    }

    if (!userId && kakuninsha) {
      const hokengaisha = new Hokengaisha();
      hokengaisha.kakuninsha = kakuninsha;
      // DB検索処理
      this.hokengaishaService.findLikeKakuninsha(hokengaisha)
      .then(res => {
        // 検索データセット
        this.dataSource = new MatTableDataSource<Hokengaisha>(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // 一覧選択状態クリア
        this.selectedHokengaisha = null;
        this.updateUserId = null;
        this.selection.clear();
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
    }

    if (userId && kakuninsha) {
      const hokengaisha = new Hokengaisha();
      hokengaisha.userId = userId;
      hokengaisha.kakuninsha = kakuninsha;
      // DB検索処理
      this.hokengaishaService.findLikeUserIdAndKakuninsha(hokengaisha)
      .then(res => {
        // 検索データセット
        this.dataSource = new MatTableDataSource<Hokengaisha>(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // 一覧選択状態クリア
        this.selectedHokengaisha = null;
        this.updateUserId = null;
        this.selection.clear();
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
    }
  }

  /*
  *  フォームクリアボタン
  *  画面を初期状態に戻す
  */
  public clear() {
    this.selectedHokengaisha = null;
    this.updateUserId = null;
    this.formGroup.reset();
    this.hokengaisha.reset();
    this.selection.clear();
    this.getHokenTantouAll();
  }

  /*
  *  閉じるボタン
  *  メイン画面開く
  */
  public close() {
    this.router.navigate(['/maintenance']);
  }

  /*
  * ユーザーIDフォーム　入力イベント処理 文字制限
  * エスケープ処理文字：\ { ]
  */
  public chkIdText(event: any) {
    this.userId.setValue( event.target.value.replace(/[^a-zA-Z0-9"¥!#$%&()=~|\-^\\'`\{@[\]+*};:<>?,./]/g, "") );
    this.userId.setValue( event.target.value.substring(0, 16) );
    event.stopPropagation();
  }

  /*
  * パスワードフォーム　入力イベント処理 文字制限
  * エスケープ処理文字：\ { ]
  */
  public chkPwdText(event: any) {
    this.password.setValue( event.target.value.replace(/[^a-zA-Z0-9"¥!#$%&()=~|\-^\\'`\{@[\]+*};:<>?,./]/g, "") );
    this.password.setValue( event.target.value.substring(0, 16) );
    event.stopPropagation();
  }

  /*
  * パスワード設定日フォーム　入力イベント処理　YYYY/MM/DD hh:mm:ss
  * ひとまず数字プラス/:のみ入力許可、update処理で書式と日付有効性を最終チェック
  */
  public chkPwdSetdateText(event: any) {
    if (event.target.value.match(/[a-zA-Z]/g)) {
      this.errorPwdSetDateMsg = 'YYYY/MM/DD 00:00:00形式';
    }
    this.passwordSetdate.setValue( event.target.value.replace(/[^0-9:/ ]/g, "") );
    event.stopPropagation();
  }

  /*
  * 警告メッセージ
  * 引数インターフィイスMsg　ソース最後に宣言
  */
  public showAlert(msg: Msg) {
    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      //height: '260px',
      //width: '290px',
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

  /*
  * 日付ゼロ埋めユーティリティ
  */
  public toDoubleDigits(num: string) {
    num += "";
    if (num.length === 1) {
      num = "0" + num;
    }
    return num;
  }

  /*
  *  ユーザーID・パスワード入力時、IMEモード警告用　Keydownイベントにて発火
  *  Mac向けの仕様、WindowsはInputタイプPasswordだと自動で入力キーが半角英数のみとなる。
  */
  public chkIme(event: any) {
    this.errorUserIdMsg = '';
    this.errorPasswordMsg = '';
    if (event.which === 229 || event.which === 0) {
      const target = event.target;
      const idAttr = target.attributes.id;
      const value = idAttr.nodeValue;
      if (value === 'userId') {
        this.errorUserIdMsg = '日本語入力です。';
      } else {
        this.errorPasswordMsg = '日本語入力です。';
      }
    } else {
      
    }
    event.stopPropagation();
  }

  /*
  *  パスワード設定日入力時、IMEモード警告とYmd形式警告　Keydownイベントにて発火
  */
  public chkImeYmd(event: any) {
    this.errorPwdSetDateMsg = '';
      if (event.which === 229 || event.which === 0) {
        this.errorPwdSetDateMsg = '日本語入力です。'; 
      }
    event.stopPropagation();
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
