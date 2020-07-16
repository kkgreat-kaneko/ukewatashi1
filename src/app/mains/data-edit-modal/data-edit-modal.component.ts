import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { ShinseishaModalComponent } from '../shinseisha-modal/shinseisha-modal.component';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { HokengaishaListService } from '../../service/hokengaisha-list.service';
import { HokengaishaList } from '../../class/hokengaisha-list';
import { HokengaishaService } from '../../service/hokengaisha.service';
import { Hokengaisha } from '../../class/hokengaisha';
import { Const } from '../../class/const';
import { Tantousha } from '../../class/tantousha';
import { TantoushaService } from '../../service/tantousha.service';
import { KanriService } from '../../service/kanri.service';
import { KanriTableService } from '../../service/kanri-table.service';
import { Kanri } from '../../class/kanri';
import { SeihoList } from '../../class/seiho-list';
import { KubunService } from '../../service/kubun.service';
import { Kubun } from '../../class/kubun';
import { ShoruiService } from '../../service/shorui.service';
import { Shorui } from '../../class/shorui';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { PopupAlertYesNoComponent } from '../../popup/popup-alert-yes-no/popup-alert-yes-no.component';
import { SessionService } from '../../service/session.service';


/*
* 書類編集フォームモーダル data-create-modalコンポーネントと基本同じ。編集データのフォームセット箇所のみ
* 考慮箇所：繰り返しボタン処理によるバリデーションチェックとして添付書類リストデータ有無のチェックをカスタム
* 設定箇所が複数なので冗長している。
*/
@Component({
  selector: 'app-data-edit-modal',
  templateUrl: './data-edit-modal.component.html',
  styleUrls: ['./data-edit-modal.component.css']
})
export class DataEditModalComponent implements OnInit {
  message: string;                                          // エラーメッセージ
  loginUser: Tantousha;                                     // ログイン担当者情報
  sakuseibi: string;                                        // 作成日整形日付（時間省略）
  shinseishaData: Kanri;                                    // Viewセット用一時申請者情報
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
  keiyakusha = new FormControl('', { validators: [Validators.required] });                                // 契約者フォーム
  hokengaisha = new FormControl('', { validators: [Validators.required] });                               // 保険会社フォーム
  kubunInput = new FormControl({value: '', disabled: false}, { validators: [Validators.required] });      // 区分手入力フォーム
  kubun = new FormControl({value: '', disabled: false}, { validators: [Validators.required] });           // 区分フォーム
  hokenTantou = new FormControl('');                        // 保険担当者フォーム
  seiho = new FormControl('');                              // 生保分フォーム
  shoukenbango = new FormControl('');                       // 証券番号フォーム
  dlvry = new FormControl(Const.DLVRY_HANDING);             // 受渡方法フォーム
  shoruiMaisu = new FormControl('');                        // 受渡枚数フォーム
  bikou = new FormControl('');                              // 備考フォーム
  shoruiUmu = new FormControl('');                          // 書類有無フォーム
  tenyuryoku = new FormControl({value: '', disabled: false});   // 添付書類手入力フォーム disabledプロパティセット

  displayColumns = ['shorui'];                              // 添付書類選択データテーブル列要素 htmlのヘッダー名表示設定無し
  shoruiSource: MatTableDataSource<Shorui>;                 // 添付書類選択用データテーブル
  shoruiSourceSelected: MatTableDataSource<Shorui>;         // 添付書類選択用データテーブル
  fromShoruiList: Shorui[];                                 // 添付書類選択用データソース
  toShoruiList: Shorui[];                                   // 添付書類選択後用データソース
  shoruiListValid = true;                                   // 編集完了ボタンdisabled用条件の１つ、添付書類有無チェック
  shoruiEdited = false;                                     // 編集フォーム更新有無判別フラグ　閉じるボタンメッセージ使用


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

  constructor(private dialog: MatDialogRef<DataEditModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Kanri,
              private shinseishaDialog: MatDialog,
              private tantosushaService: TantoushaService,
              private hokengaishaListService: HokengaishaListService,
              private hokengaishaService: HokengaishaService,
              private fb: FormBuilder,
              private kubunService: KubunService,
              private shoruiService: ShoruiService,
              private kanriService: KanriService,
              private kanriTableService: KanriTableService,
              private popupAlertDialog: MatDialog,
              private sessionService: SessionService,
  ) { }

  /*
  * ログインユーザー情報取得
  * --->getLoginTantousha処理内で、各種初期化を行っている。
  * ---->保険会社選択リストgetHokengaishaList、区分選択リストgetKubunList、添付書類データFrom/ToリストgetShoruiList
  * ---->添付書類については編集登録ではselectedKanri()内でセットしている(getShoruiListを内部で実行)
  * ---->バックエンドと非同期処理となる為、getLoginTantousha処理内での実行となっている。
  * フォームグループの初期化
  * 書類選択用テーブルイベント登録
  */
  ngOnInit() {
    this.data = this.kanriTableService.getSelected();                     // 選択書類データ初期セット
    this.sakuseibi = this.data.sakuseibi.substr(0, 10);                   // 作成日View用整形日付（時間を省略)
    this.shinseishaData = new Kanri();                                    // 一時申請者データ HTMLビュー使用とupdate時に更新データへ同期用
    this.shinseishaData.shinseishaUserId = this.data.shinseishaUserId;    // 一時申請者ID初期化
    this.shinseishaData.shinseisha = this.data.shinseisha;                // 一時申請者氏初期化
    this.shinseishaData.shinseishaKaisha = this.data.shinseishaKaisha;    // 一時申請者会社初期化
    this.shinseishaData.shinseishaTeam = this.data.shinseishaTeam;        // 一時申請者チーム部署初期化
    this.setFormGroup();                                                  // フォームをFormGroupに登録
    this.toShoruiList = [];                                               // 添付書類決定リスト用データ初期化
    
    /*
    * ログイン担当者情報取得後、担当者表示順に並び替えする為、
    * 保険会社リスト、区分リスト、書類リストの初期化を非同期処理内を実行する
    */
    this.getLoginTantousha();
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
    //this.selectedKanriSet();
  }

  /*
  *  ログイン担当者情報取得ファンクション
  *  担当者固有情報：保険会社表示順、区分表示順、書類表示順をフォームにセット
  *  書類リスト作成selectKanriSetは、レコードの添付書類を添付書類リストに追加する処理
  * 　と選択リスト表示順並び処理getShoruiListの処理を実行している
  */
  public getLoginTantousha() {
    let tantousha: Tantousha;
    this.tantosushaService.getLoginTantousha()
    .then(res => {
      this.loginUser = res;
      this.getHokengaishaList();                                            // 保険会社リスト初期化
      this.getKubunList();                                                  // 区分リスト初期化
      /*
      * 編集データのフォームへのセット処理
      * 添付書類の編集データセットは、添付選択リスト初期化getShoruiListを内部で実行セットしている
      */
      this.selectedKanriSet();
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
  * フォームグループセット処理
  *
  */
  public setFormGroup() {
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
  *  区分セレクト用データ取得
  *  全区分検索をバックエンドと通信
  *  区分フォームセットはこのファンクション内で行う
  *  非同期処理の為、バックエンドからのデータ取得処理内で
  *  区分手入力と区分マスタの比較を行い、一致がない場合は
  *  手入力フォームへセット、一致は区分選択フォームへセットする
  */
  public getKubunList() {
    this.kubunService.getAllList()
    .then(res => {
      const order = this.formatKubunOrder(this.loginUser.kubunOrder);
      this.kubunList = this.changeKubunOrder(res, order);
      this.kubunList.forEach( obj => {
        if (obj.kubun === this.data.kubun) {
          this.kubun.setValue(this.data.kubun);             // 区分フォームへセット
          this.kubunInput.disable();                        // 区分手入力フォーマット無効
          this.kubunInputDisable = true;                    // 区分手入力フォーマット背景色グレーアウト
        }
      });
      if (this.kubun.value === '') {
        this.kubunInput.setValue(this.data.kubun);          // 区分手入力フォームへセット
        this.kubun.disable();                               // 区分フォーマット無効
        this.kubunDisable = true;                           // 区分フォーマット背景色グレーアウト
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
  *  添付書類選択用用データ取得
  *  全書類検索をバックエンドと通信 Promise処理により同期を取り、
  *  編集登録用データセットをthen句内にてresetShouruiList関数を実行している
  *  この処理がないと同期が取れず、リスト初期化できない
  */
  public getShoruiList(shoruies: tmpShorui[] = null) {
    this.shoruiService.getAllList()
    .then(res => {
      const order = this.formatShoruiOrder(this.loginUser.shoruiOrder);
      this.fromShoruiList = this.changeShoruiOrder(res, order);
      this.fromShoruiList.forEach(obj => {
        obj.okng = 0;                         // 選択書類Fromリストの各書類不備情報を初期化
      });
      if (shoruies) {                         // 添付書類が有りの場合、選択用FromリストとToリストの作成処理へ(selectedKanriSetがトリガー、引数なしデフォルトNULL)
        for (const shorui of shoruies) {
          this.resetShoruiList2(shorui);
        }
      }
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
    // 添付書類可能数上限９件まで
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
  /*
  * 添付書類リストTo
  * クリック処理
  * Fromリストへの追加と削除処理 移動時にshoruiクラスにセットされている不備情報を初期化okng:0
  */
  // 添付する書類リスト
  public toShoruiListRecreate(shorui: Shorui) {
    const tempToShoruiList: Shorui[] = [];

    this.toShoruiList.forEach(obj => {
      let flg = true;                               // ForEachはreturnで抜けられない。フラグを使用する
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
    // 転記ボタンdisabled判定用 undefined--->配列初期化されてない状態=未選択の時 length=0はリストから削除された配列状態の２パターンがある
    if (typeof this.toShoruiList === 'undefined') {
      this.shoruiListValid = true;
    } else {
      if (!Object.keys(this.toShoruiList).length) {
        this.shoruiListValid = true;
      } else {
        this.shoruiListValid = false;
      }
    }
    // 書類変更フラグをセット 閉じるボタン警告メッセージ出力用
    this.shoruiEdited = true;
  }

  dblSelectToShorui(shorui: Shorui) {
    if (this.shoruiUmeChecked) {
      return 0;
    }
    this.selection.toggle(shorui);
    this.toShoruiListRecreate(this.selectedShorui);
    // 転記ボタンdisabled判定用 undefined--->配列初期化されてない状態=未選択の時 length=0はリストから削除された配列状態の２パターンがある
    if (typeof this.toShoruiList === 'undefined') {
      this.shoruiListValid = true;
    } else {
      if (!Object.keys(this.toShoruiList).length) {
        this.shoruiListValid = true;
      } else {
        this.shoruiListValid = false;
      }
    }
    // 書類変更フラグをセット 閉じるボタン警告メッセージ出力用
    this.shoruiEdited = true;
  }

  /*
  * 添付書類数オーバー時、メッセージ
  */
  alertOverNumShorui() {
    let message = ['9件以上は追加できません。'];
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
  *  申請者情報は変更選択されている場合、一時データchangeShinseihaに申請者選択ダイアログの戻り処理でセットされているので
  *  ここで確定する(更新確定前にthis.dataにセットするとmain画面の一覧データとリンクしているのでが変更されてしまう。)
  *  フォームの値をセット
  *  更新時特殊処理として、 ステータスstatusが郵送-1で受渡方法「受渡」の時(変更された)は、ステータスstatusを0にセットする。
  */
  update() {
    // 自動登録項目
    this.data.saishuHenshubi = this.sessionService.getToday();  // 最終編集日
    // 申請者 View用一時データshinseishaDataと同期
    this.data.shinseishaUserId = this.shinseishaData.shinseishaUserId;    // 申請者ID変更
    this.data.shinseisha = this.shinseishaData.shinseisha;                // 申請者氏変更
    this.data.shinseishaKaisha = this.shinseishaData.shinseishaKaisha;    // 申請者会社
    this.data.shinseishaTeam = this.shinseishaData.shinseishaTeam;        // 申請者チーム部署
    // 入力項目の値セット
    // 必須項目
    this.data.hokengaisha = this.formGroup.value.hokengaisha;   // 保険会社
    if (this.kubun.enabled) {
      this.data.kubun = this.formGroup.value.kubun;              // 区分
    } else {
      this.data.kubun = this.formGroup.value.kubunInput;         // 区分手入力
    }
    this.data.keiyakusha = this.formGroup.value.keiyakusha;     // 契約者名
    // 任意入力項目
    if (!this.formGroup.value.hokenTantou) {                    // 初期値(ブランク):NULL登録防止--->検索時の不具合防止策
      this.data.hokenTantou = '';
    } else {
      this.data.hokenTantou = this.formGroup.value.hokenTantou; // 保険担当者
    }
    if (this.formGroup.value.seiho) {                           // 生保分会社
      this.data.seihobun = Const.SEIHO_YES;
      this.data.seiho = this.formGroup.value.seiho;
    } else {
      this.data.seihobun = Const.SEIHO_NO;
      this.data.seiho = '';
    }
    this.data.dlvry = this.formGroup.value.dlvry;               // 受渡方法
    /* 郵送ステータス-1の時でも編集更新した場合は、ステータス0に戻す(チェックシート再印刷可能とする)新仕様の為以下コメントアウト
    if (this.data.dlvry === Const.DLVRY_HANDING                 // 特殊処理 ステータス-1郵送書類の受渡方法が「郵送」から「受渡」に変更された場合
      && this.data.status === Const.STATUS_DLVRY) {
        this.data.status = Const.STATUS_NOT_CHECK;              // ステータス0(受渡し前未確認)に設定する
    }
    */
    // 新仕様ステータス郵送-1のデータを編集更新した場合は、ステータス0(受渡し前未確認)に戻す
    if (this.data.status === Const.STATUS_DLVRY) {
      this.data.status = Const.STATUS_NOT_CHECK;                // ステータス0(受渡し前未確認)に設定する
      this.alertChangedStatusDlvry();                           // 警告MSG出力
    }
    this.data.shoukenbango = this.formGroup.value.shoukenbango; // 証券番号
    this.data.shoruiMaisu = this.formGroup.value.shoruiMaisu;   // 書類枚数
    this.data.bikou = this.formGroup.value.bikou;               // 備考

    if (this.formGroup.value.shoruiUmu) {                       // 注意：checkBox値とデータが逆、CheckBox:0/書類データ：1 添付有り
      this.data.shoruiUmu = Const.SHORUI_NO;                    // 書類無し カラムshorui1-10まで空データにリセット
      let i = 1;
      let keyName: string;
      let okngName: string;

      while(i < 10) {                                           // 添付書類1~9削除更新処理 System上最大9件＊テーブルカラムは10まであるが未使用
        keyName = 'shorui' + i;
        okngName = 'okng' + i;
        this.data[keyName] = '';
        this.data[okngName] = 0;
        i++;
      }
    } else {
      this.data.shoruiUmu = Const.SHORUI_YES;                   // 書類有り toShoruiList配列データをカラムshorui1-9にセットする horui1~9は並び替えられる
      let i = 1;
      let keyName: string;
      let okngName: string;
      this.toShoruiList.forEach(obj => {                        // 添付書類を更新データにセット　書類名-->shorui1~9 不備情報-->okng1~9
        keyName = 'shorui' + i;
        okngName = 'okng' + i;
        this.data[keyName] = obj.shorui;                        // 書類名は新規でない時、不備情報とセットでToリストにセットされている　カラムshorui1~9は並び替えされる
        this.data[okngName] = obj.okng;                         // 不備情報は新規でない時、選択レコード情報から書類名とペアでToリストにセットされている(selectedKanriSetでセット)
        i++;
      });
      // 選択レコードの後続添付書類を初期化更新　削除した時の残データをレコードから削除する為
      while(i < 10) {
        keyName = 'shorui' + i;
        okngName = 'okng' + i;
        this.data[keyName] = '';
        this.data[okngName] = 0;
        i++;
      }
    }
    // DB編集更新処理
    this.kanriService.updateKanri(this.data)
    .then(res => {
      // 結果確認用
      // console.log(res);
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
  * データ変更有無shoruiEditedを判別して警告メッセージを出力
  * フォームはdirtyプロパティ=true更新、よりshoruiEditedセット
  * 申請者変更はフォームではないのでselectShinseisha関数内でshoruiEditedをtrueにセット
  */
  cancel() {
    //　各フォーム更新有無(添付手入力フォームは除く) 更新有り(フォーム変更した場合)shoruiEditedフラグにセット
    let x = false;    // 意味なしゴミ変数 三項演算子のfalseダミー用
    this.keiyakusha.dirty ? this.shoruiEdited = true : x = true;
    this.hokengaisha.dirty ? this.shoruiEdited = true : x = true;
    this.kubunInput.dirty ? this.shoruiEdited = true : x = true;
    this.kubun.dirty ? this.shoruiEdited = true : x = true;
    this.hokenTantou.dirty ? this.shoruiEdited = true : x = true;
    this.seiho.dirty ? this.shoruiEdited = true : x = true;
    this.shoukenbango.dirty ? this.shoruiEdited = true : x = true;
    this.dlvry.dirty ? this.shoruiEdited = true : x = true;
    this.shoruiMaisu.dirty ? this.shoruiEdited = true : x = true;
    this.bikou.dirty ? this.shoruiEdited = true : x = true;
    this.shoruiUmu.dirty ? this.shoruiEdited = true : x = true;

    if (this.shoruiEdited) {
      this.alertShoruiEdited();
    } else {
      this.dialog.close();
    }
  }

  /*
  * 閉じるボタン時、データ変更した時閉じて良いか警告メッセージ出力
  * はい=閉じる、いいえ=閉じないで画面戻る
  */
  alertShoruiEdited() {
    const message = ['変更がありますが、終了してよいですか？'];
    const msg = {
      title: '',
      message: message
    };

    const dialogRef = this.popupAlertDialog.open(PopupAlertYesNoComponent, {
      data: msg,
      disableClose: true,
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        // nullデータ戻りチェック必須（無いとプログラムエラー)
        if (data) {
          return 0;
        } else {
          this.dialog.close();
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * 申請者変更用ボタンより、ダイアログオープン処理
  * ShinseishaModalComponent開く
  * ダイアログ戻り処理 申請者の変更処理
  * update()内データ変更セットする(shinseishaData一時保管変数)
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
          /*
          this.data.shinseishaUserId = data.userId;    // 申請者ID変更
          this.data.shinseisha = data.shimei;          // 申請者氏変更
          this.data.shinseishaKaisha = data.kaisha;    // 申請者会社
          this.data.shinseishaTeam = data.busho;       // 申請者チーム部署
          */
          this.shinseishaData.shinseishaUserId = data.userId;     // 申請者ID変更
          this.shinseishaData.shinseisha = data.shimei;           // 申請者氏変更
          this.shinseishaData.shinseishaKaisha = data.kaisha;     // 申請者会社
          this.shinseishaData.shinseishaTeam = data.busho;        // 申請者チーム部署
          this.shoruiEdited = true;                               // フォーム更新有無フラグ閉じるボタンメッセージで使用
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
      // 添付書類可能数上限９件まで
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

      // リスト追加処理
      const inputShorui = new Shorui();
      inputShorui.id = -1; // 手入力用ID -1
      inputShorui.shorui = tenyuryokuShorui;
      this.toShoruiList.push(inputShorui);
      this.shoruiSource = new MatTableDataSource<Shorui>(this.fromShoruiList);
      this.shoruiSourceSelected = new MatTableDataSource<Shorui>(this.toShoruiList);
      // 転記ボタンdisabled解除
      this.shoruiListValid = false;
      // 書類変更フラグをセット 閉じるボタン警告メッセージ用
      this.shoruiEdited = true;
      // 追加後、手入力フォームリセット
      this.tenyuryoku.reset();
    }
  }

  /*
  * 添付書類リストの状態チェックしリストdisabledを解除orセットする
  * 添付書類有り/無しチェック選択によって分岐
  * 無し-->disable解除、有り--->書類選択ある無しによってdisabledを設定
  */
  public checkShoruiUme() {
    if (!this.formGroup.value.shoruiUmu) {  // 添付書類無し *checkboxとデータの値が逆 form有り=0/データ上=1
      this.shoruiUmeChecked = true;         // 書類リストdisabledセット
      this.tenyuryoku.disable();            // 手入力添付書類フォームdisabled
      this.shoruiListValid = false;         // 転記ボタンdisabled解除
    } else {                                // 添付書類有り
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
  * 添付書類データセット処理
  * 選択リストと添付書類リストの２リストを変更する
  * 書類マスタIDを書類データ上保持していないので、書類名でしか判別不能
  * 手入力書類の判別有り
  */
 public resetShoruiList2(tmpS: tmpShorui) {
  const tempFromShoruiList: Shorui[] = [];
  let tenyuryoku = true;                            // 手入力書類判別フラグ
  this.fromShoruiList.forEach(obj => {
    let flg = true;                                 // 引数書類名との一致判別フラグ
    Object.keys(obj).forEach(key => {
      if (key === 'shorui' && obj[key] === tmpS.shorui) { // マスタに存在する書類のみ追加
        obj.okng = tmpS.okng;                       // 添付書類データ内に不備情報okngをセット、ペアで保持
        this.toShoruiList.push(obj);
        flg = false;                                // 引数書類名との一致 fromリスト追加しない　選択された添付書類リストとなる
        tenyuryoku = false;                         // 手入力書類ではない　手入力添付書類はマスタ書類と別に下段で追加処理あり
      }
    });
    if (flg) {                                      // 引数書類と一致しないリストは Tempリストへ追加する　書類選択用リストとなる
      tempFromShoruiList.push(obj);
    }
  });
  if (tenyuryoku) {                                 // 添付書類が手入力の時、手入力用IDにてShoruiモデル作成し追加
    const tenyuryokuShorui = new Shorui();
    tenyuryokuShorui.id = -1;                       // 手入力用ID:-1 すべて同じ 選択添付書類用リストからクリックイベントで削除する時、書類選択リスト(fromリスト)に戻さない用に判別する為
    tenyuryokuShorui.shorui = tmpS.shorui;          // 手入力書類名
    tenyuryokuShorui.okng = tmpS.okng;              // 手入力書類の不備情報をセット　ペアで保持
    this.toShoruiList.push(tenyuryokuShorui);
  }
  this.fromShoruiList = tempFromShoruiList;         // Tempリストを代入してFromリスト再作成
}

  /*
  *  選択レコードの書類データをフォームにセットする処理
  *  初期化処理 ngOnInit、getLoginTantousha内実行
  */
  public selectedKanriSet() {
    // 選択レコードの書類データ取得
    // const selectedKanri: Kanri = this.kanriTableService.getSelected();
    /*
    * フォーム入力項目の値をセットしていく
    */
    this.hokengaisha.setValue(this.data.hokengaisha);      // 保険会社
    this.getHokenTantouList();
    this.hokenTantou.setValue(this.data.hokenTantou);      // 保険会社担当者
    this.seiho.setValue(this.data.seiho);                  // 生保分会社
    this.keiyakusha.setValue(this.data.keiyakusha);        // 契約者名
    
//

    //this.kubun.setValue(this.data.kubun);                  // 区分

//
    this.shoukenbango.setValue(this.data.shoukenbango);    // 証券番号
    this.dlvry.setValue(this.data.dlvry);                  // 受渡方法
    this.dlvrySelected = this.data.dlvry;
    this.shoruiMaisu.setValue(this.data.shoruiMaisu);      // 書類枚数
    this.bikou.setValue(this.data.bikou);                  // 備考
    /*
    * 添付書類リストのセット処理
    * 添付書類選択リスト初期化(マスタデータ)と同時に編集データの添付書類をセット
    * 非同期通信の為、選択リスト初期化時内でのPromise処理が必要
    */
    this.toShoruiList = [];

    /*選択された管理レコードの書類shorui1~9と書類不備okng1~9をセットにして保持する為の変数*/
    const tempShoruies2: tmpShorui[] = [];
    let tempShorui2 = {
      shorui : '',
      okng : 0
    }
    /*選択された管理レコードのshorui1~9とokng1~9をセットにした添付書類データをセット*/
    let i = 1;
    let keyName: string;
    let okngName: string;
    while (i < 10) {
      keyName = 'shorui' + i;
      okngName = 'okng' + i;
      if (this.data[keyName]) {
        /* 書類1~9をデータがあれば順番にセット */
        tempShorui2 = {
          shorui : this.data[keyName],
          okng : this.data[okngName]
        }
        tempShoruies2.push(tempShorui2);
      }
      i++;
    }
    if (tempShoruies2.length < 1) {                               // 添付書類有り無し分岐処理
      this.getShoruiList();                                       // 添付書類無し-->fromリストに書類名と書類不備okng-->0初期化
    } else {                
      this.getShoruiList(tempShoruies2);                          // 添付書類有り-->fromリストから除外してtoリストにセット書類不備情報をレコードからセット
    }
    /*
    * 添付書類チェック状態セット
    * 添付書類なし--->添付書類リストと手入力添付書類のdisabled状態セット
    * 編集開いた時は、転記ボタンのdisabled初期状態は、解除。
    * 上段の添付書類リストのセット後に処理する必要あり
    */
    this.shoruiUmu.setValue(!this.data.shoruiUmu);                // 書類有無 有り1/無し０チェックボックス値が逆

    if (!this.shoruiUmu.value) {                                  // 書類がある時
      this.shoruiUmeChecked = false;                              // 書類有無チェック状態からの書類リストdisabled解除
      this.shoruiListValid = false;                               // 転記ボタンdisabled解除(初期値false)
    } else {                                                      // 書類無しチェックの時
      this.shoruiUmeChecked = true;                               // 書類有無チェック状態からの書類リストdisabledセット
      this.shoruiListValid = false;                               // 転記ボタンdisabled解除(初期値false)
      this.tenyuryoku.disable();                                  // 手入力添付書類disableセット
    }

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

  /*
  * 郵送ステータスを更新実行時に警告MSG表示
  * ステータス0に戻る旨とチェックシート再印刷をメッセージ
  */
  alertChangedStatusDlvry() {
    const message = [
      '郵送ステータス(-1)の再編集更新後は、書類受渡前ステータス(0)に戻ります。',
      '更新後は、再度チェックシート印刷を行なってください。'
    ];
    const msg = {
      title: '',
      message: message
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
        this.dialog.close();
      },
      error => {
        console.log('error');
      }
    );
  }

}

/* --------------------------------------------------------------------------------- */
/*
*  添付書類選択リスト(From,To)用インターフェイス
*  Kanriテーブルレコードの添付書類shorui1~9と書類不備フラグokng1~9を
*  ペアにして選択リストにセットする。
*  編集時に添付書類を削除追加した時、shorui1~9は並び替えが発生する(前システム仕様でも同じ)
*  並び替えが発生しても書類と不備情報が保持されるようにペアで保持
*/
export interface tmpShorui {
  shorui: string;                 // 書類名
  okng: number;                   // 書類不備フラグ
}