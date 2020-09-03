import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Const } from '../../class/const';
import { SessionService } from '../../service/session.service';
import { Tantousha } from '../../class/tantousha';
import { TantoushaService } from '../../service/tantousha.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';

@Component({
  selector: 'app-mst-tantousha',
  templateUrl: './mst-tantousha.component.html',
  styleUrls: ['./mst-tantousha.component.css']
})
export class MstTantoushaComponent implements OnInit {
  message: string;                                                    // システムエラーメッセージ
  errorUserIdMsg: string;                                             // ユーザーIDフォーム警告用エラーメッセージ
  errorPasswordMsg: string;                                           // パスワードフォーム警告用エラーメッセージ
  errorPwdSetDateMsg: string;                                         // パスワード設定日警告用エラーメッセージ
  tantousha: Tantousha;                                               // 担当者更新用・一覧選択データ用
  updateUserId: string;
  kaishaSelect = [                                                    // 会社選択フォームOption値
    { label: Const.JLX_HOKEN, value: Const.JLX_HOKEN},
    { label: Const.JLX_HS_HOKEN, value: Const.JLX_HS_HOKEN}
  ];
  kengenSelect = [                                                    // 権限選択フォームOption値Viewで使用
    { label: Const.KENGEN_NORMAL_LABEL, value: Const.KENGEN_NORMAL},
    { label: Const.KENGEN_MANAGER_LABEL, value: Const.KENGEN_MANAGER},
    { label: Const.KENGEN_ALL_LABEL, value: Const.KENGEN_ALL}
  ];
  displayColumns = [                                                  // Tantoushaプロパティと紐付けた一覧表示する列を指定 *チェックボックス用select忘れずに
    'select', 'userId', 'password', 'passwordSetdate', 'kengen', 'shimei', 'kaisha',
    'busho', 'kubun',
  ];
  dataSource: MatTableDataSource<Tantousha>;                          // 担当者一覧データソース
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;   // 一覧ページネーター参照変数 ページ送り部品
  @ViewChild(MatSort, {static: true}) sort: MatSort;                  // 一覧ソート
  selection = new SelectionModel<Tantousha>(false, []);               // 一覧選択クラス false設定は単一選択のみ(true複数選択可)
  /*
  *  セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  selection
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();

  formGroup: FormGroup;                                                               // フォームグループ、以下フォームコントロール初期化
  userId = new FormControl('', [Validators.required]);                                // ユーザーID
  password = new FormControl('', [Validators.required]);                              // パスワード
  passwordSetdate = new FormControl('');                                              // パスワード設定日
  kengen = new FormControl(Const.KENGEN_NORMAL, {                                     // 権限
    validators: [Validators.pattern('^[0-2]$')] });
  shimei = new FormControl('', [Validators.required]);                                // 氏名
  kaisha = new FormControl(Const.JLX_HOKEN);                                          // 会社名
  busho = new FormControl('', [Validators.required]);                                 // 部署名
  kubun = new FormControl('');                                                        // 区分（組織略名)
  

  constructor(private router: Router,
              private dialog: MatDialog,
              private sessionService: SessionService,
              private tantoushaService: TantoushaService,
              private fb: FormBuilder,
              private popupAlertDialog: MatDialog,
  ) { }

  ngOnInit() {
    /* ブラウザ戻るボタン禁止 */
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
      history.go(1);
    });
    
    this.setFormGroup();                                      // フォーム初期化
    this.getTantoushaList();
    /*
    *  checkBoxのselected契機で担当者一覧の選択データを保持する。Tantousha変数に選択されたselectItemを登録
    *  Tantousha変数が編集・削除のボタンから利用される
    *  選択、選択解除によってデータ保持リセット行う
    *  一覧は単一選択のみ可、Tantousha変数にセットされれた選択データ単一用、解除する処理
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.tantousha = cb.source.selected[0];
        this.userId.setValue(this.tantousha.userId);
        this.password.setValue(this.tantousha.password);
        this.passwordSetdate.setValue(this.tantousha.passwordSetdate);
        this.kengen.setValue(this.tantousha.kengen);
        this.shimei.setValue(this.tantousha.shimei);
        this.kaisha.setValue(this.tantousha.kaisha);
        this.busho.setValue(this.tantousha.busho);
        this.kubun.setValue(this.tantousha.kubun);
        this.updateUserId = this.tantousha.userId;
      } else {
        this.tantousha = null;
        this.updateUserId = null;
        this.formGroup.reset();
        this.kaisha.reset(Const.JLX_HOKEN);
        this.kengen.reset(Const.KENGEN_NORMAL);
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
      kengen: this.kengen,                                    // 権限
      shimei: this.shimei,                                    // 氏名
      kaisha: this.kaisha,                                    // 会社名
      busho: this.busho,                                      // 部署名
      kubun: this.kubun,                                      // 区分(組織略称)
    });
  }

  /*
  *  担当者データ検索処理
  *  一覧ソースdataSourceをリセット
  */
  public getTantoushaList() {
    this.tantoushaService.findall()
    .then(res => {
      this.dataSource = new MatTableDataSource<Tantousha>(res);
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

    let password = this.formGroup.value.password;                                 // 新仕様--->旧仕様空パスワード可能要確認(空パスログイン不可)
    if (!password) {
      const message = ['パスワードは、必ず入力してください。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
    }
    if (password.length < 8) {
      const message = ['パスワードは、8文字以上-16文字以内です。']                        // 新仕様--->ルール適用(16文字以上はフォームチェック処理済み)
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
    }

    let shimei = this.formGroup.value.shimei;                                 // 新仕様--->旧仕様空氏名可能変更
    if (!shimei) {
      const message = ['氏名は、必ず入力してください。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
    }

    let busho = this.formGroup.value.busho;                                 // 新仕様--->旧仕様空部署可能変更
    if (!busho) {
      const message = ['部署は、必ず入力してください。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
    }

    // DB検索処理 user_idの重複チェック--->OKならDB登録処理
    this.tantoushaService.getByID(userId)
    .then(res => {
      if (res) {
        const message = ['ユーザーID: ' + userId + ' は既に登録されています。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;                                                                     // MSG出力後、中断して戻る
      } else {
        this.tantousha = new Tantousha();
        this.tantousha.userId = userId;                                               // ユーザーID 入力制限英数一部記号のみ 16文字以内
        this.tantousha.password = this.formGroup.value.password;                      // パスワード 入力制限英数一部記号のみ 8-16文字以内
        this.tantousha.passwordSetdate = this.sessionService.getToday();              // 自動登録項目 フォーム入力不要
        !this.formGroup.value.kengen ? this.tantousha.kengen = Const.KENGEN_ALL 
          : this.tantousha.kengen = this.formGroup.value.kengen;                      // 権限未選択時、管理者権限自動登録(仕様)
        this.tantousha.shimei = this.formGroup.value.shimei;                          // 氏名
        this.tantousha.kaisha = this.formGroup.value.kaisha;                          // 会社名
        this.tantousha.busho = this.formGroup.value.busho;                            // 部署名
        this.tantousha.kubun = this.formGroup.value.kubun;                            // 区分(組織略称)
        // DB登録処理
        this.tantoushaService.create(this.tantousha)
        .then(res => {
          const message = ['ユーザーID: ' + res.userId + ', 氏名: ' + res.shimei, 'を登録しました。']
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
  *  更新ボタン this.selection.clear();
  */
  public update() {
    if (this.tantousha) {
      if (this.formGroup.value.userId !== this.updateUserId) {
        const message = ['更新実行ではユーザーIDの変更はできません。', '「登録実行」してください。']      // 新仕様　更新実行時はユーザーIDの変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }

      let password = this.formGroup.value.password;                                 // 新仕様--->旧仕様空パスワード可能要確認(空パスログイン不可)
      if (!password) {
        const message = ['パスワードは、必ず入力してください。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }
      if (password.length < 8) {
        const message = ['パスワードは、8文字以上-16文字以内です。']                      // 新仕様--->8文字以上ルール適用(元々変更画面では適用)
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

      let shimei = this.formGroup.value.shimei;                                 // 新仕様--->旧仕様空氏名可能変更
      if (!shimei) {
        const message = ['氏名は、必ず入力してください。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }

      let busho = this.formGroup.value.busho;                                 // 新仕様--->旧仕様空部署可能変更
      if (!busho) {
        const message = ['部署は、必ず入力してください。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }

      // 更新フォーム値セット
      this.tantousha.password = this.formGroup.value.password;
      this.tantousha.passwordSetdate = this.formGroup.value.passwordSetdate;
      this.tantousha.kengen = this.formGroup.value.kengen;
      this.tantousha.shimei = this.formGroup.value.shimei;
      this.tantousha.kaisha = this.formGroup.value.kaisha;
      this.tantousha.busho = this.formGroup.value.busho;
      this.tantousha.kubun = this.formGroup.value.kubun;
      // DB編集更新処理
      this.tantoushaService.update(this.tantousha)
      .then(res => {
        const message = ['ユーザーID: ' + res.userId + ', 氏名: ' + res.shimei, 'を更新しました。']
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
    if (this.tantousha) {
      if (this.formGroup.value.userId !== this.updateUserId) {
        const message = ['削除実行はユーザーIDの変更ができません。']      // 新仕様　更新実行時はユーザーIDの変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }
      // DB削除処理
      this.tantoushaService.delete(this.tantousha.userId)
      .then(res => {
        if (res) {
          const message = ['ユーザーID: ' + this.tantousha.userId + ' を削除しました。']
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
  * ユーザーIDと氏名の部分一致検索
  * 3フォーム入力パターンの処理分岐 ユーザーIDのみ、氏名のみ、両方
  */
  public find() {
    const userId = this.formGroup.value.userId;
    const shimei = this.formGroup.value.shimei;
    if (userId && !shimei) {
      const tantousha = new Tantousha();
      tantousha.userId = userId;
      // DB検索処理
      this.tantoushaService.findLikeUserId(tantousha)
      .then(res => {
        // 検索データセット
        this.dataSource = new MatTableDataSource<Tantousha>(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // 一覧選択状態クリア
        this.tantousha = null;
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

    if (!userId && shimei) {
      const tantousha = new Tantousha();
      tantousha.shimei = shimei;
      // DB検索処理
      this.tantoushaService.findLikeShimei(tantousha)
      .then(res => {
        // 検索データセット
        this.dataSource = new MatTableDataSource<Tantousha>(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // 一覧選択状態クリア
        this.tantousha = null;
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

    if (userId && shimei) {
      const tantousha = new Tantousha();
      tantousha.userId = userId;
      tantousha.shimei = shimei;
      // DB検索処理
      this.tantoushaService.findLikeUserIdAndShimei(tantousha)
      .then(res => {
        // 検索データセット
        this.dataSource = new MatTableDataSource<Tantousha>(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // 一覧選択状態クリア
        this.tantousha = null;
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
    this.tantousha = null;
    this.updateUserId = null;
    this.formGroup.reset();
    this.kaisha.reset(Const.JLX_HOKEN);
    this.kengen.reset(Const.KENGEN_NORMAL);
    this.selection.clear();
    this.getTantoushaList();
  }

  /*
  *  閉じるボタン
  *  メイン画面開く
  */
  public close() {
    this.router.navigate(['/maintenance']);
  }

  /*
  * 一覧 権限名称表示
  */
  public showKengenName(kengen: number): string {
    let strKengen = '';
    switch (kengen) {
      case Const.KENGEN_ALL:
        strKengen = Const.KENGEN_ALL_LABEL;
        break;
      case Const.KENGEN_MANAGER:
        strKengen = Const.KENGEN_MANAGER_LABEL;
        break;
      case Const.KENGEN_NORMAL:
        strKengen = Const.KENGEN_NORMAL_LABEL;
        break;
    }
    return strKengen;
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