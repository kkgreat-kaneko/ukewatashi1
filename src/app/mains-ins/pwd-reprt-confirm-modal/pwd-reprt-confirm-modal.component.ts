import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { SessionService } from '../../service/session.service';
import { Const } from '../../class/const';
import { Kanri } from '../../class/kanri';
import { Tantousha } from '../../class/tantousha';
import { TantoushaService } from '../../service/tantousha.service';

@Component({
  selector: 'app-pwd-reprt-confirm-modal',
  templateUrl: './pwd-reprt-confirm-modal.component.html',
  styleUrls: ['./pwd-reprt-confirm-modal.component.css']
})
export class PwdReprtConfirmModalComponent implements OnInit {
  message: string;                                                              // システムエラーメッセージ
  errorMsg = '';                                                                // Viewメッセージ
  jlxBusho: string;                                                             // ログイン画面別JLX/JLXHS担当部署名 画面内文言用
  jlxPrtUserID: string;                                                         // 印刷前認証パスワードのユーザー
  prtAuthUser: Tantousha;                                                       // 印刷認証用ユーザー
  formGroup: FormGroup;                                                         // フォームグループ、以下フォームコントロール初期化
  password = new FormControl('');                                               // パスワード入力

  constructor(private dialog: MatDialogRef<PwdReprtConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Kanri,                      // data-->インジェクション書類管理データ(未使用)
    private sessionService: SessionService,
    private tantoushaService: TantoushaService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    /*
    * 保険会社ログイン先画面によって印刷パスワード画面内文言用JLX部署名と印刷認証ユーザーをセット
    */
    if (this.sessionService.getHokenLoginKaisha() === Const.JLX_HOKEN) {
      this.jlxBusho = Const.JLX_HOKEN_BUSHO;
      this.jlxPrtUserID = Const.PRINT_JLX_HOKEN_USER;
    } else {
      this.jlxBusho = Const.JLX_HS_HOKEN_BUSHO;
      this.jlxPrtUserID = Const.PRINT_JLXHS_HOKEN_USER;
    }
    this.prtAuthUser = new Tantousha();                                         // 印刷認証用ユーザー初期化
    this.prtAuthUser.userId = this.jlxPrtUserID;
    this.formGroup = this.fb.group({                                            // フォームグループ初期化
      password: this.password,                                                  // パスワード
    });
  }

  /*
  *  OKボタン処理
  *  印刷担当者パスワード入力チェック
  */
  public prtAuth() {
    this.prtAuthUser.password = this.password.value;
    this.tantoushaService.prtAuth(this.prtAuthUser)
    .then(res => {
      if (res) {
        this.dialog.close(this.data);
      } else {
        this.errorMsg = 'パスワードが違います。';
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
  * ダイアログ閉じるボタン処理
  */
  close() {
    this.dialog.close();
  }

  /*
  *  パスワード入力時、IMEモード警告用　Keydownイベントにて発火
  *  Mac向けの仕様、WindowsはInputタイプPasswordだと自動で入力キーが半角英数のみとなる。
  */
  public chkIme(event: any) {
    if (event.which === 229 || event.which === 0) {
      this.errorMsg = 'キーが日本語入力モードです。';
    } else {
      this.errorMsg = '';
    }
  }

}
