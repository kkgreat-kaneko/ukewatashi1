import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { SessionService } from '../../service/session.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { Const } from '../../class/const';
import { Kanri } from '../../class/kanri';
import { KanriService } from '../../service/kanri.service';
import { Hokengaisha } from '../../class/hokengaisha';

@Component({
  selector: 'app-data-check-modal',
  templateUrl: './data-check-modal.component.html',
  styleUrls: ['./data-check-modal.component.css']
})
export class DataCheckModalComponent implements OnInit {
  message: string;                                                              // エラーメッセージ
  loginUser: Hokengaisha;                                                       // ログインユーザー情報
  viewOkShorui = String(Const.SHORUI_OK);                                       // OK書類選択値(DB属性number、HTMLstringへ変換)
  viewNgShorui = String(Const.SHORUI_NG);                                       // NG書類選択値(DB属性number、HTMLstringへ変換)

  formGroup: FormGroup;                                                         // フォームグループ、以下フォームコントロール初期化
  okng1 = new FormControl({value: '', disabled: true});                         // 書類1 OK/NG選択
  okng2 = new FormControl({value: '', disabled: true});                         // 書類2 OK/NG選択
  okng3 = new FormControl({value: '', disabled: true});                         // 書類3 OK/NG選択
  okng4 = new FormControl({value: '', disabled: true});                         // 書類4 OK/NG選択
  okng5 = new FormControl({value: '', disabled: true});                         // 書類5 OK/NG選択
  okng6 = new FormControl({value: '', disabled: true});                         // 書類6 OK/NG選択
  okng7 = new FormControl({value: '', disabled: true});                         // 書類7 OK/NG選択
  okng8 = new FormControl({value: '', disabled: true});                         // 書類8 OK/NG選択
  okng9 = new FormControl({value: '', disabled: true});                         // 書類9 OK/NG選択
  fubi1 = new FormControl({value: '', disabled: true});                         // 不備理由1
  fubi2 = new FormControl({value: '', disabled: true});                         // 不備理由2
  fubi3 = new FormControl({value: '', disabled: true});                         // 不備理由3
  fubi4 = new FormControl({value: '', disabled: true});                         // 不備理由4
  fubi5 = new FormControl({value: '', disabled: true});                         // 不備理由5
  fubi6 = new FormControl({value: '', disabled: true});                         // 不備理由6
  fubi7 = new FormControl({value: '', disabled: true});                         // 不備理由7
  fubi8 = new FormControl({value: '', disabled: true});                         // 不備理由8
  fubi9 = new FormControl({value: '', disabled: true});                         // 不備理由9
  
  shorui1: string;                                                              // 書類１表示　Viewセット用　添付書類なしの時「添付書類なし」をセット

  constructor(private dialog: MatDialogRef<DataCheckModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Kanri,                      // data-->インジェクション書類管理データ
              private sessionService: SessionService,
              private popupAlertDialog: MatDialog,
              private kanriService: KanriService,
              private fb: FormBuilder,
    ) { }

  ngOnInit() {
    this.dialog.updatePosition({ top: '2%', left: '15%' });                     // ダイアログ画面位置指定
    this.loginUser = this.sessionService.getHokenLoginTantou();                 // ログイン保険担当者情報セット
    this.setFormGroup();                                                        // フォーブグループセット
    this.isChecShoruiAll();                                                     // 書類1~9データ有無よりOK/NG選択disabled設定処理
    this.isShoruiUmu()                                                          // 添付書類有無チェック--->なし：書類１に「添付書類なし」を表示
    if (this.data.status !== Const.STATUS_NOT_CHECK) {
      this.initOkNgFubi();
    }
  }

  private setFormGroup() {
    this.formGroup = this.fb.group({                                            // フォームグループ初期化
      okng1: this.okng1,                                                        // 書類OK/NG
      okng2: this.okng2,                                      
      okng3: this.okng3,                                                        // 書類OK/NG
      okng4: this.okng4,                                                        // 書類OK/NG
      okng5: this.okng5,                                                        // 書類OK/NG
      okng6: this.okng6,                                                        // 書類OK/NG
      okng7: this.okng7,                                                        // 書類OK/NG
      okng8: this.okng8,                                                        // 書類OK/NG
      okng9: this.okng9,                                                        // 書類OK/NG
      fubi1: this.fubi1,                                                        // 書類不備理由
      fubi2: this.fubi2,                                                        // 書類不備理由
      fubi3: this.fubi3,                                                        // 書類不備理由
      fubi4: this.fubi4,                                                        // 書類不備理由
      fubi5: this.fubi5,                                                        // 書類不備理由
      fubi6: this.fubi6,                                                        // 書類不備理由
      fubi7: this.fubi7,                                                        // 書類不備理由
      fubi8: this.fubi8,                                                        // 書類不備理由
      fubi9: this.fubi9,                                                        // 書類不備理由
    });
  }

  /*
  *  書類データ箇所のデータ有無状態からOK/NG選択フォームdisabled解除処理をまとめて実行(初期disabled)
  */
  public isChecShoruiAll() {
    this.isCheckShorui(this.data.shorui1,this.okng1, this.fubi1);              // 書類1設定
    this.isCheckShorui(this.data.shorui2,this.okng2, this.fubi2);              // 書類2設定
    this.isCheckShorui(this.data.shorui3,this.okng3, this.fubi3);              // 書類3設定
    this.isCheckShorui(this.data.shorui4,this.okng4, this.fubi4);              // 書類4設定
    this.isCheckShorui(this.data.shorui5,this.okng5, this.fubi5);              // 書類5設定
    this.isCheckShorui(this.data.shorui6,this.okng6, this.fubi6);              // 書類6設定
    this.isCheckShorui(this.data.shorui7,this.okng7, this.fubi7);              // 書類7設定
    this.isCheckShorui(this.data.shorui8,this.okng8, this.fubi8);              // 書類8設定
    this.isCheckShorui(this.data.shorui9,this.okng9, this.fubi9);              // 書類9設定
  }

  /*
  * 添付書類なし:shoruiUmu:1データの処理
  * 書類1のView変数shorui1に「添付書類なし」をセットする。
  * データ更新用にok_shorui_ichiranに[添付書類なし]をセットする。
  */
  public isShoruiUmu() {
    if (this.data.shoruiUmu === Const.SHORUI_NO) {
      this.shorui1 = '添付書類なし';                                            // 書類1のView変数にセット *kanri.shorui1は空文字のまま
    } else {
      this.shorui1 = this.data.shorui1;
    }
  }

  /*
  *  添付書類1~9の有無チェック用
  *  有る時、ok/ng選択と不備理由inputのdisabledを解除する。
  */
  public isCheckShorui(shorui: string, okng: FormControl, fubi: FormControl) {
    if (shorui) {
      okng.enable();
      fubi.enable();
    }
  }

  /*
  *  確認済分の書類チェックの時、
  *  OK/NGが選択されている状態にする。また不備理由に値をセットする。
  */
  public initOkNgFubi() {
    // 書類1~9有無とOK/NG選択セット、不備理由セットループ処理
    const oknges = [this.okng1, this.okng2, this.okng3, this.okng4, this.okng5,
      this.okng6, this.okng7, this.okng8, this.okng9];
    const fubies = [this.fubi1, this.fubi2, this.fubi3, this.fubi4, this.fubi5,
      this.fubi6, this.fubi7, this.fubi8, this.fubi9];
    let i = 1;
    while(i < 10) {
      let keyName = 'shorui' + i;
      let keyName2 = 'okng' + i;
      /*
      *  書類1~9データ有る時、紐づいたokng値が不備であれば不備理由の入力必須
      *  不備書類がJLX側で再編集で書類が追加された時のケースは、OK書類一覧を書類名検索してなければ、OK/NS選択はセットしない(未選択状態とする)
      */
      if (this.data[keyName]) {
        if (this.data[keyName2] == Const.SHORUI_OK 
              && this.data.okShoruiIchiran.indexOf(this.data[keyName]) > -1) {
          oknges[i-1].setValue(this.viewOkShorui);
          fubies[i-1].disable();
        }
        if (this.data[keyName2] == Const.SHORUI_NG) {
          oknges[i-1].setValue(this.viewNgShorui);
          const len = this.data[keyName].length;
          const start = this.data.hokenBikou.indexOf(this.data[keyName]);
          const end = this.data.hokenBikou.indexOf(']', start);
          const fubi = this.data.hokenBikou.substring(start + len + 1, end);
          fubies[i-1].setValue(fubi);
        }
      }
      i++;
    }
  }

  /* 新仕様OK/NG選択イベント処理
  *  書類1~9のOK/NG選択
  *  OK選択--->不備理由フォームをdisabledに変更
  *  NG選択--->不備理由フォームをdisabled解除
  */
  public checkedOkNg(okng: string, fubi: FormControl) {
    if (okng === this.viewOkShorui) {
      fubi.disable();
    } else {
      fubi.enable();
    }
  }

  /*
  *  保存して閉じるボタン処理
  *  更新固定値--->status(1,3)、確認日(初回のみ)、最終確認日(更新時毎回)、確認者(毎回更新?)
  *　書類別OK/NG別処理--->OK書類一覧(OK書類名[]囲み、無い時空文字'')、NG書類一覧(NG書類名[]囲み、無い時空文字'')、
  *  NG書類不備理由(保険備考にNG書類名[]囲み、無い時空文字'')、okng1~9（0:OK,1:NG)
  */
  public save() {
    if (!this.isSelectedOkNg()) {
      return;
    }
    if (!this.isInputFubi()) {
      return;
    }
    // Kanriデータセット処理
    if (this.data.status === Const.STATUS_NOT_CHECK) {            // 確認日（status:0の時毎回更新、未確認に戻す処理ケースある為)
      this.data.kakuninbi = this.sessionService.getToday();
    }
    if (this.isSelectedNg()) {
      this.data.status = Const.STATUS_NG;                         // 不備書類status:3セット
    } else {
      this.data.status = Const.STATUS_CHECK;                      // 確認済status:1セット　OK選択もしくは添付書類なし
    }
    this.data.kakuninsha = this.loginUser.kakuninsha              // 確認者(ログイン保険担当者名)
    
    this.data.saishuKakuninbi = this.sessionService.getToday();   // 最終確認日
    this.setOkNgData();                                           // okng1~9、OK書類一覧、不備書類一覧、保険会社備考をセット
    if (this.data.shoruiUmu === Const.SHORUI_NO) {                // 添付書類なしの時 OK書類一覧にセット
      this.data.okShoruiIchiran = '[添付書類なし]';
    }

    // DB編集更新処理
    this.kanriService.updateKanri(this.data)
    .then(res => {
      // 結果確認用
      /*debug*/ //console.log(res);
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
      // 同期処理　最終処理ダイアログ閉じる
      this.dialog.close(this.data);
    });

  }

  /*
  *  保存前チェック処理　書類のOK/NGが選択されているかチェック
  *  選択漏れがあればMSG + falseを返す
  */
  public isSelectedOkNg(): boolean {
    // チェックフラグ
    let selectedOkNg = true;
    // 書類1~9有無とOK/NG選択有無チェックループ処理
    const oknges = [this.okng1, this.okng2, this.okng3, this.okng4, this.okng5,
      this.okng6, this.okng7, this.okng8, this.okng9];
    let i = 1;
    while(i < 10) {
      let keyName = 'shorui' + i;
      // 書類1~9データ有無とOK/NG登録チェック
      if (this.data[keyName]) {
        if (!oknges[i-1].value) {                             // フォーム入力要素が選択・セットされていない
          selectedOkNg = false;
        }
      }
      i++;
    }
    if (!selectedOkNg) {
      const message = ['すべての書類のOK/NGを確認してください。'];
      const msg = {
        title: '',
        message: message
      };
      this.showAlert(msg);
      return selectedOkNg;
    }
    return selectedOkNg;
  }

  /*
  *  NG選択時チェック処理
  *　不備理由に入力必須--->無し警告MSG
  */
  public isInputFubi(): boolean {
    // チェックフラグ
    let notInputFubi = false;
    // 書類1~9有無とOK/NG選択有無チェックループ処理
    const oknges = [this.okng1, this.okng2, this.okng3, this.okng4, this.okng5,
      this.okng6, this.okng7, this.okng8, this.okng9];
    const fubies = [this.fubi1, this.fubi2, this.fubi3, this.fubi4, this.fubi5,
      this.fubi6, this.fubi7, this.fubi8, this.fubi9];
    let i = 1;
    while(i < 10) {
      let keyName = 'shorui' + i;
      // 書類1~9データ有る時、紐づいたokng値が不備であれば不備理由の入力必須
      if (this.data[keyName]) {
        if (oknges[i-1].value === this.viewNgShorui) {          // NG選択
          if (!fubies[i-1].value) {
            notInputFubi = true;                                // 不備理由が未入力フラグ
          }
        }
      }
      i++;
    }
    if (notInputFubi) {
      const message = ['不備の理由を入力してください。'];
      const msg = {
        title: '',
        message: message
      };
      this.showAlert(msg);
      return false;
    }
    return true;
  }

  /*
  *  NG選択有るかチェック
  *  選択あれば、status:3にセットする為の判別用
  */
  public isSelectedNg(): boolean {
    // チェックフラグ
    let selectedNg = false;
    // 書類1~9有無とOK/NG選択有無チェックループ処理
    const oknges = [this.okng1, this.okng2, this.okng3, this.okng4, this.okng5,
      this.okng6, this.okng7, this.okng8, this.okng9];
    let i = 1;
    while(i < 10) {
      let keyName = 'shorui' + i;
      // 書類1~9データ有無とOK/NG登録チェック
      if (this.data[keyName]) {
        if (oknges[i-1].value === this.viewNgShorui) {              // NG選択されている時
          selectedNg = true;
        }
      }
      i++;
    }
    return selectedNg;
  }

  /*
  *  OK/NG選択別 データセット処理
  *  okng1~9、ok_shorui_ichiran、fubi_shorui_ichiran、hoken_bikouへのセットを行う
  */
  public setOkNgData() {
    let okShoruiIchiran = [''];                                     // OK書類一覧初期化(空文字)
    let fubiShoruiIchiran = [''];                                   // NG書類一覧初期化(空文字)
    let hokenBikou = [''];                                          // 保険会社備考初期化(空文字)
    const oknges = [this.okng1, this.okng2, this.okng3, this.okng4, this.okng5,
      this.okng6, this.okng7, this.okng8, this.okng9];
    const fubies = [this.fubi1, this.fubi2, this.fubi3, this.fubi4, this.fubi5,
      this.fubi6, this.fubi7, this.fubi8, this.fubi9];
    let i = 1;
    while(i < 10) {
      let keyName = 'shorui' + i;
      let keyName2 = 'okng' + i;
      // 書類1~9データ有無とOK/NG登録チェック
      if (this.data[keyName]) {
        if (oknges[i-1].value === this.viewOkShorui) {                                // OK選択されている時
          this.data[keyName2] = Const.SHORUI_OK;                                      // okng1~9
          okShoruiIchiran.push('[' + this.data[keyName] + ']');                       // OK書類一覧
        }
        if (oknges[i-1].value === this.viewNgShorui) {                                 // NG選択されている時
          this.data[keyName2] = Const.SHORUI_NG;                                       // okng1~9
          fubiShoruiIchiran.push('[' + this.data[keyName] + ']');                      // 不備書類一覧
          hokenBikou.push('[' + this.data[keyName] + ':' + fubies[i-1].value + ']');   // 保険会社備考
        }
      }
      i++;
    }
    this.data.okShoruiIchiran = okShoruiIchiran.join('');
    this.data.fubiShoruiIchiran = fubiShoruiIchiran.join('');
    this.data.hokenBikou = hokenBikou.join('');
  }

  /*
  *  すべてOKボタン処理
  */
  public setOkAll() {
    // 書類1~9有無とOK/NG選択配列セット
    const oknges = [this.okng1, this.okng2, this.okng3, this.okng4, this.okng5,
      this.okng6, this.okng7, this.okng8, this.okng9];
    const fubies = [this.fubi1, this.fubi2, this.fubi3, this.fubi4, this.fubi5,
      this.fubi6, this.fubi7, this.fubi8, this.fubi9];
    let i = 1;
    while(i < 10) {
      let keyName = 'shorui' + i;
      let keyName2 = 'okng' + i;
      // 書類1~9データ有る時(OK選択可能)、OK選択状態にセットする
      if (this.data[keyName]) {
          oknges[i-1].setValue(this.viewOkShorui);
          fubies[i-1].disable();
      }
      i++;
    }
  }

  /*
  * ダイアログ閉じるボタン処理
  */
  cancel() {
    this.dialog.close();
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