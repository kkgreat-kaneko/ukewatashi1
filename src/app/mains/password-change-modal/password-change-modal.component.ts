import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { Tantousha } from '../../class/tantousha';
import { TantoushaService } from '../../service/tantousha.service';
import { SessionService } from '../../service/session.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';

@Component({
  selector: 'app-password-change-modal',
  templateUrl: './password-change-modal.component.html',
  styleUrls: ['./password-change-modal.component.css']
})
export class PasswordChangeModalComponent implements OnInit {
  message: string;                                                                // 処理エラーメッセージ
  pwdExpired = false;                                                             // 有効期限フラグ初期化
  pwdErrs: string[];                                                              // パスワード入力エラーメッセージ
  formGroup: FormGroup;                                                           // フォームグループ、以下フォームコントロール初期化
  currentPasswd = new FormControl('', { validators: [Validators.required] });     // フォームinput「現在のパスワード」
  newPasswd = new FormControl('', { validators: [Validators.required] });         // フォームinput「新しいのパスワード」
  newConfirmPasswd = new FormControl('', { validators: [Validators.required] });  // フォームinput「新しいのパスワード確認」
  loginUser: Tantousha;                                                           // ログインユーザー情報

  constructor(private dialog: MatDialogRef<PasswordChangeModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Tantousha,  // data-->インジェクション担当者データ
              private fb: FormBuilder,                          // フォームグループ追加用ビルダー
              private tantoushaService: TantoushaService,       // 担当者情報サービス
              private sessionService: SessionService,           // セッション汎用サービス
              private popupAlertDialog: MatDialog,              // メッセージ出力用
    ) { }

  ngOnInit() {
    this.getLoginTantousha();                                   // バックエンドから最新ログインユーザー情報取得
    this.setFormGroup();                                        // フォームコントローラーをグループへセット処理
    if (this.data.passwordSetdate === 'expired') {              // 有効期限切れ時、閉じるボタンDisabledフラグ用
      this.pwdExpired = true;
    }
  }

  public setFormGroup() {
    this.formGroup = this.fb.group({                            // フォームグループ初期化
      currentPasswd: this.currentPasswd,                        // 現在のパスワード
      newPasswd: this.newPasswd,                                // 新しいパスワード
      newConfirmPasswd: this.newConfirmPasswd,                  // 新しいパスワード確認
    });
  }

  /*
  *  パスワード変更ボタン
  */
  public changePwd() {
    this.pwdErrs = [];
    if (this.loginUser.password !== this.formGroup.value.currentPasswd) {
      this.pwdErrs.push('＊現在のパスワードが違います。');
    }
    if (this.loginUser.password === this.formGroup.value.newPasswd) {
      this.pwdErrs.push('＊現在のパスワードと同じものは使えません。');
    }
    if ( !/^[\w!"#$%&'()=~|\-^¥`\{@\[\]\+\*\};:<>\?,\.\/]{1,100}$/g.test(this.formGroup.value.newPasswd) ) {
      this.pwdErrs.push('＊パスワードは英数字記号のみです。');
    }
    if (this.formGroup.value.newPasswd.length < 8) {
      this.pwdErrs.push('＊パスワードは8文字以上必要です。');
    }
    if (this.formGroup.value.newPasswd !== this.formGroup.value.newConfirmPasswd) {
      this.pwdErrs.push('*新しいパスワードと確認パスワードが違います。');
    }
    /*
    *  入力パスワード検査失敗、パスワード変更処理せず戻る
    */
    if (this.pwdErrs.length > 0) {
      return 0;
    }
    /*
    *  パスワード更新処理
    *  ログインユーザー情報のパスワードとパスワードセット日時を更新する
    *  パスワード変更画面を閉じる（担当者データを読み出し元MainComponentに渡す*変更完了判別用として)
    */
    this.loginUser.password = this.formGroup.value.newPasswd;
    this.loginUser.passwordSetdate = this.sessionService.getToday();
    this.tantoushaService.update(this.loginUser)
    .then(res => {
      this.data = res;
      this.dialog.close(this.data);
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'ERROR(パスワード変更処理失敗)管理者へ確認';
    })
    .then(() => {
      // anything finally method
    });
  }

  /*
  *  ログイン担当者情報取得ファンクション
  *  担当者固有情報：保険会社表示順、をセット
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
  *  ダイアログ閉じるボタン
  */
  close() {
    this.dialog.close();
  }
}
