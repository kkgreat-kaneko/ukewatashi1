import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { ShinseishaModalComponent } from '../shinseisha-modal/shinseisha-modal.component';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HokengaishaListService } from '../../service/hokengaisha-list.service';
import { HokengaishaList } from '../../class/hokengaisha-list';
import { HokengaishaService } from '../../service/hokengaisha.service';
import { Hokengaisha } from '../../class/hokengaisha';
import { SessionService } from '../../service/session.service';
import { Const } from '../../class/const';
import { TantoushaService } from '../../service/tantousha.service';
import { Tantousha } from '../../class/tantousha';
import { KanriService } from '../../service/kanri.service';
import { Kanri } from '../../class/kanri';
import { SeihoList } from '../../class/seiho-list';
import { KubunService } from '../../service/kubun.service';
import { Kubun } from '../../class/kubun';
import { ShoruiService } from '../../service/shorui.service';
import { Shorui } from '../../class/shorui';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';


/*
* 書類入力フォームモーダル
* 考慮箇所：繰り返しボタン処理によるバリデーションチェックとして添付書類リストデータ有無のチェックをカスタム
* 設定箇所が複数なので冗長している。
*/
@Component({
  selector: 'app-data-create-modal',
  templateUrl: './data-create-modal.component.html',
  styleUrls: ['./data-create-modal.component.css']
})
export class DataCreateModalComponent implements OnInit {
  message: string;                                          // エラーメッセージ
  loginUser: Tantousha;                                     // ログイン担当者情報
  sakuseibi: string;                                        // 作成日整形日付（時間を省略)
  hokengaishaList: HokengaishaList[];                       // 保険会社選択リスト用
  hokenTantouList: Hokengaisha[];                           // 保険会社担当者選択リスト用
  seihoList: SeihoList[];                                   // 生保分選択リスト用
  kubunList: Kubun[];                                       // 区分リスト用
  dlvryList = [                                             // 受渡リスト用初期化（受渡、郵送)
    { label: Const.DLVRY_HANDING, value: Const.DLVRY_HANDING },
    { label: Const.DLVRY_MAIL, value: Const.DLVRY_MAIL},
  ];
  dlvrySelected = Const.DLVRY_HANDING;                      // 受渡方法セレクト初期値
  shoruiUmeChecked = false;                                 // 添付書類有無チェック判定用
  kubunInputDisable = false;                                // 区分手入力判定用
  kubunDisable = false;                                     // 区分選択判定用

  formGroup: FormGroup;                                     // フォームグループ、以下フォームコントロール初期化
  keiyakusha = new FormControl('', { validators: [Validators.required] });      // 契約者フォーム
  hokengaisha = new FormControl('', { validators: [Validators.required] });     // 保険会社フォーム
  kubunInput = new FormControl({value: '', disabled: false}, { validators: [Validators.required] });      // 区分手入力フォーム
  kubun = new FormControl({value: '', disabled: false}, { validators: [Validators.required] });           // 区分フォーム
  hokenTantou = new FormControl('');                        // 保険担当者フォーム
  seiho = new FormControl('');                              // 生保分フォーム
  shoukenbango = new FormControl('');                       // 証券番号フォーム
  dlvry = new FormControl(Const.DLVRY_HANDING);             // 受渡方法フォーム
  shoruiMaisu = new FormControl('', { validators: [Validators.required] });                               // 受渡枚数フォーム
  bikou = new FormControl('');                              // 備考フォーム
  shoruiUmu = new FormControl('');                          // 書類有無フォーム
  tenyuryoku = new FormControl({value: '', disabled: false});   // 添付書類手入力フォーム disabledプロパティセット

  displayColumns = ['shorui'];                              // 添付書類選択データテーブル列要素 htmlのヘッダー名表示設定無し
  shoruiSource: MatTableDataSource<Shorui>;                 // 添付書類選択用データテーブル
  shoruiSourceSelected: MatTableDataSource<Shorui>;         // 添付書類選択用データテーブル
  fromShoruiList: Shorui[];                                 // 添付書類選択用データソース
  toShoruiList: Shorui[];                                   // 添付書類選択後用データソース
  shoruiListValid = true;
  reuseKanriData: Kanri;


  /*
  *  添付書類選択用テーブルチェックボックス選択コレクションオブジェクト
  *  選択状態自体を管理する
  */
  selection = new SelectionModel<Shorui>(false, []);
  /*
  * セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();
  selectedShorui: Shorui;

  constructor(private dialog: MatDialogRef<DataCreateModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Kanri,
              private shinseishaDialog: MatDialog,
              private tantosushaService: TantoushaService,
              private hokengaishaListService: HokengaishaListService,
              private hokengaishaService: HokengaishaService,
              private fb: FormBuilder,
              private kubunService: KubunService,
              private shoruiService: ShoruiService,
              private kanriService: KanriService,
              private popupAlertDialog: MatDialog,
              private sessionService: SessionService,
  ) { }

  /*
  * ログインユーザー情報取得
  * 管理データ登録初期値セット
  * フォーム選択用データをマスターより取得処理
  * フォームグループの初期化
  * 書類選択用テーブルイベント登録
  */
  ngOnInit() {
    this.data = this.kanriService.createInitData(this.data);  // 書類管理データ固定初期化
    this.sakuseibi = this.data.sakuseibi.substr(0, 10);       // 作成日View用整形日付（時間を省略)
    this.reuseKanriData = this.kanriService.getReuseKanri();  // 繰り返し用データセット

    /*
    * ログイン担当者情報取得後、担当者表示順に並び替えする為、
    * 保険会社リストgetHokenbgaishgaList、
    * 区分リストgetKubunList、
    * 書類リストの初期化getShoruiList
    * --->getLoginTantousha非同期処理内で実行する
    */
    this.getLoginTantousha();                                 // 保険会社リスト初期化 担当者表示順よりセット
    
    this.toShoruiList = [];                                   // 添付書類決定リスト用データ初期化

    this.formGroup = this.fb.group({                          // フォームグループ初期化
      keiyakusha: this.keiyakusha,                            // 契約者名フォーム
      hokengaisha: this.hokengaisha,                          // 保険会社フォーム
      hokenTantou: this.hokenTantou,                          // 保険担当者フォーム
      seiho: this.seiho,                                      // 生保フォーム
      shoukenbango: this.shoukenbango,                        // 証券番号フォーム
      kubunInput: this.kubunInput,                            // 区分手入力フォーム
      kubun: this.kubun,                                      // 区分フォーム
      dlvry: this.dlvry,                                      // 受渡方法フォーム
      shoruiMaisu: this.shoruiMaisu,                          // 書類枚数フォーム
      bikou: this.bikou,                                      // 備考フォーム
      shoruiUmu: this.shoruiUmu,                              // 書類有無フォーム
      tenyuryoku: this.tenyuryoku,                            // 書類手入力フォーム
    });
    /*
    *  checkBoxのselected契機で申請者テーブル選択データ保持serviceに選択されたselectItemを登録
    *  ShinseishaTableServiceが呼び出しから利用される
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.selectedShorui = cb.source.selected[0];
      } else {
        // this.selectedShorui = null;
      }
    });
  }

  /*
  *  ログイン担当者情報取得ファンクション
  *  担当者固有情報：保険会社表示順、区分表示順、書類表示順をセット
  */
  public getLoginTantousha() {
    let tantousha: Tantousha;
    this.tantosushaService.getLoginTantousha()
    .then(res => {
      this.loginUser = res;
      this.getHokengaishaList();                                            // 保険会社リスト初期化
      this.getKubunList();                                                  // 区分リスト初期化
      this.getShoruiList();                                                 // 添付書類選択リスト初期化
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
  *  担当者の表示順に並び替えも行う
  */
  public getHokengaishaList() {
    this.hokengaishaListService.getAllList()
    .then(res => {
      const order = this.formatHokengaishaOrder(this.loginUser.hokengaishaOrder);
      this.hokengaishaList = this.changeHokengaishaOrder(res, order);
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
  * 保険担当者選択リスト処理
  * 保険会社選択紐付け処理
  * 保険担当者、生保分のセレクトを変更 テーブルhokengaishaからカラムhokengaisha,seiho検索
  */
  public getHokenTantouList() {
    this.hokenTantou.reset();
    const hokengaisha = new Hokengaisha();
    hokengaisha.hokengaisha = this.formGroup.value.hokengaisha;
    this.hokengaishaService.getHokenTantouList(hokengaisha)
    .then(res => {
      this.hokenTantouList = res;
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });

    /* 生保分セレクト用データ取得
    *  保険会社を選択した値をキーに生保会社検索をバックエンドと通信
    *  保険会社の選択必要。保険会社担当者と連動。
    */
    this.seiho.reset();
    const seiho = new SeihoList();
    seiho.hokengaisha = this.formGroup.value.hokengaisha;
    this.hokengaishaService.getSeihoList(seiho)
    .then(res => {
      this.seihoList = res;
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
  *  区分セレクト用データ取得、ユーザー表示順に並び替え
  *  全区分検索をバックエンドと通信
  */
  public getKubunList() {
    this.kubunService.getAllList()
    .then(res => {
      const order = this.formatKubunOrder(this.loginUser.kubunOrder);
      this.kubunList = this.changeKubunOrder(res, order);
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
  *  添付書類選択用用データ取得、ユーザー表示順に並び替え
  *  全書類検索をバックエンドと通信
  */
  public getShoruiList() {
    this.shoruiService.getAllList()
    .then(res => {
      const order = this.formatShoruiOrder(this.loginUser.shoruiOrder);
      this.fromShoruiList = this.changeShoruiOrder(res, order);
      this.shoruiSource = new MatTableDataSource<Shorui>(this.fromShoruiList);
      this.shoruiSourceSelected = new MatTableDataSource<Shorui>(this.toShoruiList);
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
  * 添付書類リストFROM
  * クリック処理
  * Toリストへの追加と削除処理
  */
  // 添付書類選択リスト
  public fromShoruiListRecreate(shorui: Shorui) {
    // 添付書類可能数上限9件まで
    if (this.toShoruiList.length > 8 ) {
      this.alertOverNumShorui();
      return 0;
    }
    const tempFromShoruiList: Shorui[] = [];

    this.fromShoruiList.forEach(obj => {
      let flg = true;

      Object.keys(obj).forEach(key => {
        if (key === 'id' && obj[key] === shorui.id) {
          this.toShoruiList.push(obj);
          flg = false;
        }
      });

      if (flg) {
        tempFromShoruiList.push(obj);
      }
    });
    this.fromShoruiList = tempFromShoruiList;
    this.shoruiSource = new MatTableDataSource<Shorui>(this.fromShoruiList);
    this.shoruiSourceSelected = new MatTableDataSource<Shorui>(this.toShoruiList);
  }
  // 添付する書類リスト
  public toShoruiListRecreate(shorui: Shorui) {
    const tempToShoruiList: Shorui[] = [];

    this.toShoruiList.forEach(obj => {
      let flg = true;
      if (obj.id === shorui.id) {
        if (shorui.id !== -1) {                     // マスタ書類の時、Fromリストに戻す
          obj.okng = 0;                             // ToリストからFromに戻す時セットされている不備情報を初期化
          this.fromShoruiList.push(obj);
          flg = false; 
        } else if (obj.shorui === shorui.shorui) {  // 手入力添付書類はFromリストに戻さず削除 共通id-1では判別できないので書類名で判別、書類名は重複無し
          flg = false;
        } 
      }
      if (flg) {                                    // ダブルクリック書類にヒットしなければToリスト用一時データに追加
        tempToShoruiList.push(obj);
      }
    });
    this.toShoruiList = tempToShoruiList;
    this.shoruiSource = new MatTableDataSource<Shorui>(this.fromShoruiList);
    this.shoruiSourceSelected = new MatTableDataSource<Shorui>(this.toShoruiList);
  }
  /*
  * 添付書類リスト ダブルクリックイベント処理
  * どちらかリストへ移動
  */
  dblSelectFromShorui(shorui: Shorui) {
    if (this.shoruiUmeChecked) {
      return 0;
    }
    this.selection.toggle(shorui);
    this.fromShoruiListRecreate(this.selectedShorui);
    // 転記ボタンdisabled判定用
    if (typeof this.toShoruiList === 'undefined') {
      this.shoruiListValid = true;
    } else {
      if (!Object.keys(this.toShoruiList).length) {
        this.shoruiListValid = true;
      } else {
        this.shoruiListValid = false;
      }
    }
  }

  dblSelectToShorui(shorui: Shorui) {
    if (this.shoruiUmeChecked) {
      return 0;
    }
    this.selection.toggle(shorui);
    this.toShoruiListRecreate(this.selectedShorui);
    // 転記ボタンdisabled判定用
    if (typeof this.toShoruiList === 'undefined') {
      this.shoruiListValid = true;
    } else {
      if (!Object.keys(this.toShoruiList).length) {
        this.shoruiListValid = true;
      } else {
        this.shoruiListValid = false;
      }
    }
  }
  /*
  * 添付書類数オーバー時、メッセージ
  */
  alertOverNumShorui() {
    let message = ['添付書類は、上限９件まで可能です。'];
    const msg = {
      title: '添付書類上限数について',
      message: message,
    };

    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
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
  * 添付手入力書類で同じ名前が既に存在している時、メッセージ
  */
  alertNgNameShorui() {
    let message = ['既に存在します。'];
    const msg = {
      title: '',
      message: message,
    };

    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
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
  *  転記ボタン処理 data固定値はngInitでセット済み
  *  申請者情報は申請者選択ダイアログの戻り処理でセット済み
  */
  create() {
    // 入力項目の値セット
    // 必須項目
    this.data.id = 0;                                            // 新規デフォルトid:0 必須の為ダミーid
    this.data.sakuseibi = this.sessionService.getToday();        // 作成日 転記ボタンクリック時点日時で再セットする
    this.data.saishuHenshubi = this.sessionService.getToday();   // 最終編集日
    this.data.hokengaisha = this.formGroup.value.hokengaisha;    // 保険会社
    if (this.kubun.enabled) {
      this.data.kubun = this.formGroup.value.kubun;              // 区分
    } else {
      this.data.kubun = this.formGroup.value.kubunInput;         // 区分手入力
      this.data.kubunInput = this.formGroup.value.kubunInput;    // 繰り返しボタン処理で使用　区分手入力フォーム反映用
    }
    this.data.keiyakusha = this.formGroup.value.keiyakusha;      // 契約者名
    // 任意入力項目
    if (!this.formGroup.value.hokenTantou) {                     // 初期値(ブランク):NULL登録防止--->検索時の不具合防止策
      this.data.hokenTantou = '';
    } else {
      this.data.hokenTantou = this.formGroup.value.hokenTantou;  // 保険担当者
    }
    if (this.formGroup.value.seiho) {                            // 生保
      this.data.seihobun = Const.SEIHO_YES;
      this.data.seiho = this.formGroup.value.seiho;
    } else {
      this.data.seihobun = Const.SEIHO_NO;
      this.data.seiho = '';
    }
    this.data.dlvry = this.formGroup.value.dlvry;               // 受渡方法
    this.data.shoukenbango = this.formGroup.value.shoukenbango; // 証券番号
    this.data.shoruiMaisu = this.formGroup.value.shoruiMaisu;   // 書類枚数
    this.data.bikou = this.formGroup.value.bikou;               // 備考

    if (this.formGroup.value.shoruiUmu) {
      this.data.shoruiUmu = Const.SHORUI_NO;                    // 書類無し
    } else {
      this.data.shoruiUmu = Const.SHORUI_YES;                   // 書類有り
      let i = 1;
      let keyName: string;
      this.toShoruiList.forEach(obj => {
        keyName = 'shorui' + i;
        this.data[keyName] = obj.shorui;
        i++;
      });
    }
    // 繰り返し用データをKanriサービスで保持して呼び出し可能とする為、入力データ複製をKanriサービスのプロパティに保存
    this.kanriService.setReuseKanri(this.data);
    // DB新規登録処理
    this.kanriService.createKanri(this.data)
    .then(res => {
      // 結果確認用console.log(res);
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });

    this.dialog.close(this.data);
  }

  /*
  * ダイアログキャンセルボタン処理
  */
  cancel() {
    this.dialog.close();
  }

  /*
  * 申請者変更用ボタンより、ダイアログオープン処理
  * ShinseishaModalComponent開く
  * ダイアログ戻り処理 申請者の変更処理
  */
  public selectShinseisha() {
    const dialogRef = this.shinseishaDialog.open(ShinseishaModalComponent, {
      data: Tantousha,
      disableClose: true,
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        // nullデータ戻りチェック必須（無いとプログラムエラー)
        if (data.userId) {
          this.data.shinseishaUserId = data.userId;    // 申請者ID変更
          this.data.shinseisha = data.shimei;          // 申請者氏変更
          this.data.shinseishaKaisha = data.kaisha;    // 申請者会社
          this.data.shinseishaTeam = data.busho;       // 申請者チーム部署
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * 手入力添付書類追加ボタン
  * 手入力書類IDは共通-1とする
  * 同じ書類名の追加は不可。
  */
  public addShoruiList() {
    // 先頭(^)に続く空白(\s)」と「末尾($)の空白(\s)」を空文字('')で置替、空文字は処理せずreturn
    let tenyuryokuShorui = this.formGroup.value.tenyuryoku.replace(/^\s+|\s+$/g, '');
    if (tenyuryokuShorui) {
      // 添付書類可能数上限9まで
      if (this.toShoruiList.length > 8 ) {
        this.alertOverNumShorui();
        return 0;
      }
      // 添付書類リスト内に同じ書類名あるか検索しあれば処理中断メッセージ出力
      // forEachはreturnでは抜けられない-->すべて操作される。フラグで判別してメッセージ処理する
      let chkNgName = false;
      this.toShoruiList.forEach(obj => {
        Object.keys(obj).forEach(key => {
          if (key === 'shorui' && obj[key] === tenyuryokuShorui) {
            chkNgName = true;
          }
        });
      });
      // 同じ書類名だめメッセージ
      if (chkNgName) {
        this.alertNgNameShorui();
        return 0;
      }

      const inputShorui = new Shorui();
      inputShorui.id = -1; // 手入力用ID -1
      inputShorui.shorui = tenyuryokuShorui;
      this.toShoruiList.push(inputShorui);
      this.shoruiSource = new MatTableDataSource<Shorui>(this.fromShoruiList);
      this.shoruiSourceSelected = new MatTableDataSource<Shorui>(this.toShoruiList);
      // 転記ボタンdisabled解除
      this.shoruiListValid = false;
      // 追加後、手入力フォームリセット
      this.tenyuryoku.reset();
    }
  }

  /*
  * 添付書類有無チェックボックスのイベント処理
  * 添付書類リストの状態チェックしリストdisabledを解除orセットする
  * 添付書類有り/無しチェック選択によって分岐
  * 無し-->disable解除、有り--->書類選択ある無しによってdisabledを設定
  */
  public checkShoruiUme() {
    if (!this.formGroup.value.shoruiUmu) {  // 添付書類無しチェック
      this.shoruiUmeChecked = true;         // 書類リストdisabledセット
      this.tenyuryoku.disable();            // 手入力添付書類フォームdisabled
      this.shoruiListValid = false;         // 転記ボタンdisabled解除
    } else {                                // 添付書類有りチェック
      this.shoruiUmeChecked = false;        // 書類リストdisabled解除
      this.tenyuryoku.enable()              // 手入力添付書類フォームdisabled解除
      // 転記ボタンdisabled判定用
      if (typeof this.toShoruiList === 'undefined') {
        this.shoruiListValid = true;
      } else {
        if (!Object.keys(this.toShoruiList).length) {
          this.shoruiListValid = true;
        } else {
          this.shoruiListValid = false;
        }
      }
    }
  }


  /*
  * 繰り返しボタン処理
  * Kanriサービス保持している転記前入力データを再セット
  * 再セットする項目仕様 保険会社・保険会社担当者・区分・受渡方法・添付書類と有無 のみ。他はセットしない。
  */
  public reuseKanri() {
    // 繰り返し用データセットある時のみ繰り返しボタンEnable
    if (this.reuseKanriData) {
      this.hokengaisha.setValue(this.reuseKanriData.hokengaisha);      // 保険会社
      this.getHokenTantouList();
      this.hokenTantou.setValue(this.reuseKanriData.hokenTantou);      // 保険会社担当者
      this.keiyakusha.setValue(this.reuseKanriData.keiyakusha);        // 契約者
      if (this.reuseKanriData.kubunInput) {
        this.kubunInput.setValue(this.reuseKanriData.kubunInput);      // 区分手入力
        this.kubun.disable();                                          // 区分無効
        this.kubunDisable = true;                                      // 区分グレーアウト
      } else {
        this.kubun.setValue(this.reuseKanriData.kubun);                // 区分
        this.kubunInput.disable();                                     // 区分手入力無効
        this.kubunInputDisable = true;                                 // 区分手入力グレーアウト
      }
      this.dlvry.setValue(this.reuseKanriData.dlvry);                  // 受渡方法
      this.shoruiMaisu.setValue(this.reuseKanriData.shoruiMaisu);      // 書類枚数
      /*
      * 添付書類リストのセット処理
      */
      this.toShoruiList = [];
      let i = 1;
      let keyName: string;
      while (i < 10) {
        keyName = 'shorui' + i;
        if (this.reuseKanriData[keyName]) {
          this.reuseShoruiList(this.reuseKanriData[keyName]);
        }
        i++;
      }
      this.shoruiSource = new MatTableDataSource<Shorui>(this.fromShoruiList);
      this.shoruiSourceSelected = new MatTableDataSource<Shorui>(this.toShoruiList);
      /*
      * 添付書類チェック状態セット
      * 添付書類リストのdisabled状態と転記ボタンのdisabled状態のセット
      * 上段の添付書類リストのセット後に処理する必要あり
      */
      this.shoruiUmu.setValue(!this.reuseKanriData.shoruiUmu);         // 書類有無 有り1/無し０チェックボックス値が逆
      if (!this.reuseKanriData.shoruiUmu) {
        this.shoruiUmeChecked = true;                         // 書類有無チェック状態からの書類リストdisabledセット
        this.shoruiListValid = false;                         // 転記ボタンdisabled解除
      } else {
        this.shoruiUmeChecked = false;                        // 書類有無チェック状態からの書類リストdisabled解除
        // 転記ボタンdisabled判定用
        if (typeof this.toShoruiList === 'undefined') {       // 転記ボタンdisabledセットor解除
          this.shoruiListValid = true;
        } else {
          if (!Object.keys(this.toShoruiList).length) {
            this.shoruiListValid = true;
          } else {
            this.shoruiListValid = false;
          }
        }
      }

    }
  }

  /*
  * 繰り返しボタン処理: 添付書類データセット処理
  * 選択リストと添付書類リストの２リストを変更する
  * 書類マスタIDを書類データ上保持していないので、書類名でしか判別不能
  * 手入力書類の判別有り
  */
  public reuseShoruiList(shorui: string) {
    const tempFromShoruiList: Shorui[] = [];
    let tenyuryoku = true;
    this.fromShoruiList.forEach(obj => {
      let flg = true;
      Object.keys(obj).forEach(key => {
        if (key === 'shorui' && obj[key] === shorui) {
          this.toShoruiList.push(obj);
          flg = false;
          tenyuryoku = false;
        }
      });
      if (flg) {
        tempFromShoruiList.push(obj);
      }
    });
    if (tenyuryoku) {
      const tenyuryokuShorui = new Shorui();
      tenyuryokuShorui.id = -1;
      tenyuryokuShorui.shorui = shorui;
      this.toShoruiList.push(tenyuryokuShorui);
    }
    this.fromShoruiList = tempFromShoruiList;
  }

  /*
  *  区分手入力と区分の状態（入力or選択)によってどちらかをdisabled:trueに変更する
  *  どちらか一方のみの入力を許可
  */
  public changeKubun(element: HTMLElement) {
    if ( element.getAttribute('formControlName') === 'kubun' ) {
      if ( this.formGroup.value.kubun !== '' ) {
        this.kubunInput.disable();
        this.kubunInputDisable = true;
        this.kubunDisable = false;
      } else {
        this.kubunInput.enable();
        this.kubunInputDisable = false;
      }
    } else if ( element.getAttribute('formControlName') === 'kubunInput' ) {
      if ( this.formGroup.value.kubunInput !== '' ) {
        this.kubun.disable();
        this.kubunDisable = true;
        this.kubunInputDisable = false;
      } else {
        this.kubun.enable();
        this.kubunDisable = false;
      }
    }
  }

  /*
  * メンテナンス表示順設定による並び替え、未設定の場合はNULLを返す--->NULLの時changeHokengaishaOrderで条件処理
  * カンマ区切りID並び順文字列データを数字配列に変換
  * 
  */
  formatHokengaishaOrder(hokengaishaOrder: string): number[] {
    if (typeof hokengaishaOrder === "undefined") {
      return null;
    }
    const arr = hokengaishaOrder.split(',');
    return arr.map( sid => parseInt(sid, 10) );
  }

  /*
  *  保険会社並び順変更処理ファンクション
  *  担当者が保持している並びに変更
  */
  changeHokengaishaOrder(list: HokengaishaList[], order: number[]): HokengaishaList[] {
    // 並び順設定がない時NULL マスタ検索id昇順リストを返す
    if (!order) {
      return list;
    }
    // 並び順指定に変更
    const hokengaishaList: HokengaishaList[] = [];
    for ( let num of order ) {
      for ( let hokengaisha of list ) {
        if ( num === hokengaisha.id ) {
          hokengaishaList.push(hokengaisha);
        }
      }
    }
    // マスタ最新データとの差異を調整 並び順後のデータに含まれてなければ、最新書類をpushする
    for ( let hokengaisha of list )  {
      let notInclude = true;
      for ( let orderedHokengaisha of hokengaishaList ) {
        if (orderedHokengaisha.id === hokengaisha.id) {
          notInclude = false;
        }
      }
      if (notInclude) {
        hokengaishaList.push(hokengaisha);
      }
    }
    return hokengaishaList;
  }

  /*
  * メンテナンス表示順設定による並び替え、未設定の場合はNULLを返す--->NULLの時changeKubunOrderで条件処理
  * カンマ区切りID並び順文字列データを数字配列に変換
  * 
  */
  formatKubunOrder(kubunOrder: string): number[] {
    if (typeof kubunOrder === "undefined") {
      return null;
    }
    const arr = kubunOrder.split(',');
    return arr.map( sid => parseInt(sid, 10) );
  }

  /*
  *  区分並び順変更処理ファンクション
  *  担当者が保持している並びに変更
  */
  changeKubunOrder(list: Kubun[], order: number[]): Kubun[] {
    // 並び順設定がない時NULL マスタ検索id昇順リストを返す
    if (!order) {
      return list;
    }
    // 並び順指定に変更
    const kubunList: Kubun[] = [];
    for ( let num of order ) {
      for ( let kubun of list ) {
        if ( num === kubun.id ) {
          kubunList.push(kubun);
        }
      }
    }
    // マスタ最新データとの差異を調整 並び順後のデータに含まれてなければ、最新書類をpushする
    for ( let kubun of list )  {
      let notInclude = true;
      for ( let orderedKubun of kubunList ) {
        if (orderedKubun.id === kubun.id) {
          notInclude = false;
        }
      }
      if (notInclude) {
        kubunList.push(kubun);
      }
    }
    return kubunList;
  }

  /*
  * メンテナンス表示順設定による並び替え、未設定の場合はNULLを返す--->NULLの時changeShoruiOrderで条件処理
  * カンマ区切りID並び順文字列データを数字配列に変換
  * 
  */
  formatShoruiOrder(shoruiOrder: string): number[] {
    if (typeof shoruiOrder === "undefined") {
      return null;
    }
    const arr = shoruiOrder.split(',');
    return arr.map( sid => parseInt(sid, 10) );
  }

  /*
  *  書類並び順変更処理ファンクション
  *  担当者が保持している並びに変更
  */
  changeShoruiOrder(list: Shorui[], order: number[]): Shorui[] {
    // 並び順設定がない時NULL マスタ検索id昇順リストを返す
    if (!order) {
      return list;
    }
    // 並び順指定に変更
    const shoruiList: Shorui[] = [];
    for ( let num of order ) {
      for ( let shorui of list ) {
        if ( num === shorui.id ) {
          shoruiList.push(shorui);
        }
      }
    }
    // マスタ最新データとの差異を調整 並び順後のデータに含まれてなければ、最新書類をpushする
    for ( let shorui of list )  {
      let notInclude = true;
      for ( let orderedShorui of shoruiList ) {
        if (orderedShorui.id === shorui.id) {
          notInclude = false;
        }
      }
      if (notInclude) {
        shoruiList.push(shorui);
      }
    }
    return shoruiList;
  }

}
