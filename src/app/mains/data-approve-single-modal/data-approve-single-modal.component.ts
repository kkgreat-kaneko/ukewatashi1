import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SessionService } from '../../service/session.service';
import { KanriService } from '../../service/kanri.service';
import { Const } from '../../class/const';
import { Kanri } from '../../class/kanri';

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
            ) { }

  ngOnInit() {
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
    });

    this.dialog.close(this.data);
  }

  /*
  *  いいえボタン処理 キャンセルダイアログ閉じる
  */
  cancel() {
    this.dialog.close();
  }

}
