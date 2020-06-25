import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { Tantousha } from '../../class/tantousha';
import { TantoushaService } from '../../service/tantousha.service';
import { SessionService } from '../../service/session.service';
import { Hokengaisha } from '../../class/hokengaisha';
import { HokengaishaList } from '../../class/hokengaisha-list';
import { HokengaishaService } from '../../service/hokengaisha.service';
import { HokengaishaListService } from '../../service/hokengaisha-list.service';
import { Kanri } from '../../class/kanri';
import { KanriService } from '../../service/kanri.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';

@Component({
  selector: 'app-data-hoken-print-modal',
  templateUrl: './data-hoken-print-modal.component.html',
  styleUrls: ['./data-hoken-print-modal.component.css']
})
export class DataHokenPrintModalComponent implements OnInit {
  message: string;                                                              // エラーメッセージ
  loginUser: Tantousha;                                                         // ログインユーザー情報
  formGroup: FormGroup;                                                         // フォームグループ、以下フォームコントロール初期化
  hokengaisha = new FormControl('', { validators: [Validators.required] });     // 保険会社フォーム
  hokenTantou = new FormControl('', { validators: [Validators.required] });     // 保険担当者フォーム
  hokengaishaList: HokengaishaList[];                                           // 保険会社選択リスト用
  hokenTantouList: Hokengaisha[];                                               // 保険会社担当者選択リスト用
  prtHokenConfirm: boolean;                                                     // 印刷ボタンdisabled用フラグ

  constructor(private dialog: MatDialogRef<DataHokenPrintModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Tantousha,                  // data-->インジェクション担当者データ
              private fb: FormBuilder,                                          // フォームグループ追加用ビルダー
              private kanriService: KanriService,                               // 管理書類データサービス
              private tantoushaService: TantoushaService,                       // 担当者情報サービス
              private sessionService: SessionService,                           // セッション汎用サービス
              private hokengaishaListService: HokengaishaListService,           // 保険会社マスタサービス
              private hokengaishaService: HokengaishaService,                   // 保険会社担当者マスタサービス
              private popupAlertDialog: MatDialog,                              // メッセージ出力用
  ) { }

  ngOnInit() {
    this.dialog.updatePosition({ top: '5%', left: '30%' });                     // ダイアログ画面位置指定
    this.prtHokenConfirm = false;
    this.getLoginTantousha();
    this.setFormGroup();
    this.getHokengaishaList();
  }


  /*
  *  ログイン担当者情報取得ファンクション
  */
  public getLoginTantousha() {
    let tantousha: Tantousha;
    this.tantoushaService.getLoginTantousha()
    .then(res => {
      this.loginUser = res;
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = '担当者データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });
  }

  /*
  *   フォーム初期化処理
  */
  public setFormGroup() {
    this.formGroup = this.fb.group({                            // フォームグループ初期化
      hokengaisha: this.hokengaisha,                            // 保険会社選択フォーム
      hokenTantou: this.hokenTantou,                            // 保険会社担当者
    });
  }

  /*
  *  保険会社セレクト用データ取得
  *  全保険会社検索をバックエンドと通信
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
  * 保険担当者選択リスト処理
  * 保険会社選択紐付け処理
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
  }

  /*
  *   印刷ボタン
  *   選択保険会社、(現在不要仕様の保険担当者)をバックエンドに送信して、確認書印刷を実行する
  *   印刷前、件数チェック後、有り--->PDF帳票作成ダウンロードバックエンド通信
  *   無し--->メッセージ出力
  */
  public printHokenConfirm() {

    const kanri = new Kanri();
    kanri.shinseishaKaisha = this.loginUser.kaisha;
    kanri.hokengaisha = this.hokengaisha.value;
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
        //this.kanriService.printHokenConfirm(kanri); /*popupブロック許可不要MSG無し*
        let message = ['確認書をダウンロードします。'];
        const msg = {
          title: '',
          message: message,
        };
        this.msgAndPrint(msg, kanri);
        
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
  *  ダイアログ閉じるボタン
  */
  close() {
    this.dialog.close();
  }

  /*
  * 印刷案件無しメッセージ用
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
  * メッセージ後、確認書印刷
  */
  public msgAndPrint(msg: Msg, kanri: Kanri) {
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
        this.kanriService.printHokenConfirm(kanri);
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