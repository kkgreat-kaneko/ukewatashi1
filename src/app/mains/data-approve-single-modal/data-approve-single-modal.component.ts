import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { SessionService } from '../../service/session.service';
import { KanriService } from '../../service/kanri.service';
import { Const } from '../../class/const';
import { Kanri } from '../../class/kanri';
import { PopupAlertYesNoComponent } from '../../popup/popup-alert-yes-no/popup-alert-yes-no.component';

@Component({
  selector: 'app-data-approve-single-modal',
  templateUrl: './data-approve-single-modal.component.html',
  styleUrls: ['./data-approve-single-modal.component.css']
})
export class DataApproveSingleModalComponent implements OnInit {
  message: string;
  btnAppStr: string;
  setApprove: boolean;

  constructor(private dialog: MatDialogRef<DataApproveSingleModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Kanri,
              private sessionService: SessionService,
              private kanriService: KanriService,
              private popupAlertDialog: MatDialog,
            ) { }

  ngOnInit() {
    this.dialog.updatePosition({ top: '5%' });                     // ダイアログ画面位置指定

    if (this.data.statusApp === Const.APP_STATUS_NOT) {
      this.btnAppStr = '承　　認';
      this.setApprove = true;
    }
    if (this.data.statusApp === Const.APP_STATUS_OK) {
      this.btnAppStr = '承　　認　　戻　　し';
      this.setApprove = false;
    }
  }

  /*
  *  承認・承認戻し実行
  *  承認戻しの場合、確認メッセージにて認証後となる。
  */
  beforeApproveKanri() {
    if (this.setApprove) {
      this.approveKanri();
    } else {
      this.alertNotApprove();
    }
  }

  /*
  *  mainコンポーネントからのInject書類データには更新用に値がセットされているので
  *  バックエンドへ更新処理を実行
  *  承認ステータス、承認者or未承認者、承認日or未承認日をセットする
  */
  public approveKanri() {
    const loginUser = this.sessionService.setLoginUser();
    if (this.setApprove) {
      this.data.statusApp = Const.APP_STATUS_OK;
      this.data.shouninsha = loginUser.shimei;
      this.data.shouninbi = this.sessionService.getToday();
    } else {
      this.data.statusApp = Const.APP_STATUS_NOT;
      this.data.mishouninsha = loginUser.shimei;
      this.data.mishouninbi = this.sessionService.getToday();
    }
    this.kanriService.approveKanri(this.data)
    .then(res => {
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
      // ダイアログ閉じる処理を同期処理内で実行。実行しない場合先に戻ってしまい一覧表示が同期されなくなる。
      this.dialog.close(this.data);
    });

  }

  /*
  * 承認戻しボタンクリック時の確認メッセージ出力
  * はい=承認戻し処理、いいえ=画面戻る
  * popupAlertYesNoComponent仕様戻りdataがfalse=はい、true=いいえボタン
  */
  alertNotApprove() {
    const message = ['「承認済み」を「未承認」に戻します。', 'よろしいですか？'];
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
        // いいえクリック時、承認戻し処理しないで画面に戻る
        if (data) {
          return 0;
        // はいクリック時、承認処理実行
        } else {
          //this.dialog.close();
          this.approveKanri();
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  いいえボタン処理 キャンセルダイアログ閉じる
  */
  cancel() {
    this.dialog.close();
  }

}
