import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { KanriService } from '../../service/kanri.service';
import { KanriTableService } from '../../service/kanri-table.service';
import { SessionService } from '../../service/session.service';
import { Kanri } from '../../class/kanri';
import { Const } from '../../class/const';
import { Tantousha } from '../../class/tantousha';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-data-delete-modal',
  templateUrl: './data-delete-modal.component.html',
  styleUrls: ['./data-delete-modal.component.css']
})
export class DataDeleteModalComponent implements OnInit {
  message: string;                                          // エラーconsolelog用
  loginUser = new Tantousha();                              // ログインユーザー情報用
  //sakujyoriyuReadOnly = '';                               // 削除理由有無 初期値無し
  //buttonDisabled = false;                                 // 実行ボタン可能判定
  formGroup: FormGroup;                                     // フォームグループ、以下フォームコントロール初期化
  sakujyoriyu: FormControl;                                 // 削除理由フォーム
  //sakujyoriyu = new FormControl('', { validators: [Validators.required] });                        // 削除理由フォーム


  constructor(private dialog: MatDialogRef<DataDeleteModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Kanri,  // data-->インジェクション書類データ
              private kanriService: KanriService,
              private kanriTableService: KanriTableService,
              private sessionService: SessionService,
              private fb: FormBuilder,
              private popupAlertDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loginUser = this.sessionService.setLoginUser();      // ログインユーザー情報取得
    this.data = this.kanriTableService.getSelected();         // インジェクションに選択された書類データ初期セット
    if (this.data.status === Const.STATUS_NG) {               // Status3=不備の時、以下組み合わせ
      //this.sakujyoriyuReadOnly = null;                      // 削除理由フォームを入力可能とする
      //this.buttonDisabled = true;                           // 実行ボタン不可（削除理由入力後可能)
      this.sakujyoriyu = new FormControl('', { validators: [Validators.required] });  // 削除理由フォーム作成必須条件とする
    } else {
      this.sakujyoriyu = new FormControl('');                 // 削除理由フォーム作成必須条件なし
    }
    this.setFormGroup();                                      // フォームコントローラーをグループへセット処理
  }

  public setFormGroup() {
    this.formGroup = this.fb.group({                          // フォームグループ初期化
      sakujyoriyu: this.sakujyoriyu,                          // 削除理由フォーム
    });
  }

  /*
  * 削除ボタン処理
  * DB更新 KanriService
  *
  */
  public deleteKanri() {
    this.data.sakujyoriyu = this.formGroup.value.sakujyoriyu; // 削除理由セット
    this.data.sakujyosha = this.loginUser.shimei;             // 担当者セット
    // DB編集更新処理
    this.kanriService.deleteKanri(this.data)
    .then(res => {
      // 特に処理無し
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
      this.dialog.close(this.data); // data返すが、mainComponentでは特にはdataの処理はしない。
    });

  }

  /*
  * ダイアログキャンセルボタン処理
  */
  cancel() {
    this.dialog.close();
  }

}
