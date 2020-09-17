import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { KanriService } from '../../service/kanri.service';


@Component({
  selector: 'app-data-approve-multi-modal',
  templateUrl: './data-approve-multi-modal.component.html',
  styleUrls: ['./data-approve-multi-modal.component.css']
})
export class DataApproveMultiModalComponent implements OnInit {
  message: string;    // エラーメッセージ
  msg: string;        // ダイアログメッセージ

  constructor(private dialog: MatDialogRef<DataApproveMultiModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ApproveData,
              private kanriService: KanriService,
            ) { }

  ngOnInit() {
    const msgApp = '選択されている案件を一括で「承認」します。';
    const msgNotApp = '選択されている案件を一括で「未承認」に戻します。';
    this.data.setApprove ? this.msg = msgApp : this.msg = msgNotApp;
  }

  /*
  *  一括承認処理 はいボタン処理
  */
  approve() {
    this.kanriService.approveKanries(this.data)
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
  *  いいえボタン処理 キャンセルダイアログ閉じる
  */
  cancel() {
    this.dialog.close();
  }
}

// 承認データDTO
export interface ApproveData {
  setApprove: boolean;      // 承認モード:true・未承認モード:falseの判別フラグセット
  kanriIds: number[];       // 対象書類データのIDをセット
  shouninsha: string;       // 承認者
  shouninbi: string;        // 承認日
  mishouninsha: string;     // 未承認者
  mishouninbi: string;      // 未承認日
  // saishuHenshubi: string;
}
