import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { KanriService } from '../../service/kanri.service';
import { Kanri } from '../../class/kanri';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';


@Component({
  selector: 'app-data-print-modal',
  templateUrl: './data-print-modal.component.html',
  styleUrls: ['./data-print-modal.component.css']
})
export class DataPrintModalComponent implements OnInit {
  message: string;
  printList: any[] = [];   // 印刷帳票別集合データ
  printHeader: Kanri;      // 印刷画面ヘッダー部用
  printStartPage = 0;      // 印刷開始ページ番号
  printMaxPage: number;    // 印刷最終ページ番号
  printCurPage: number;    // 印刷表示ページ番号


  printData: Kanri[];   // テストデモ用

  constructor(private dialog: MatDialogRef<DataPrintModalComponent>,
              private popupAlertDialog: MatDialog,
              private kanriService: KanriService,
              @Inject(MAT_DIALOG_DATA) public data: Kanri[]
            ) { }

  ngOnInit() {
    /*
    * Injectデータから印刷データ用作成。
    * ---> (保険会社・保険担当者・受渡方法)別に集める（配列)
    */
    let printDataes: Kanri[] = [];
    let beforeKanri: Kanri;

    // 印刷データ作成開始
    this.data.forEach( kanri => {
      // 初回ループ比較データにセット
      if (!beforeKanri) {
        beforeKanri = kanri;
      }

      if (kanri.hokengaisha === beforeKanri.hokengaisha) {
        if (kanri.hokenTantou === beforeKanri.hokenTantou) {
          if (kanri.dlvry === beforeKanri.dlvry) {
            printDataes.push(kanri);
            beforeKanri = kanri;
          } else {
            this.printList.push(printDataes);
            printDataes = [];
            printDataes.push(kanri);
            beforeKanri = kanri;
          }
        } else {
          this.printList.push(printDataes);
          printDataes = [];
          printDataes.push(kanri);
          beforeKanri = kanri;
        }
      } else {
        this.printList.push(printDataes);
        printDataes = [];
        printDataes.push(kanri);
        beforeKanri = kanri;
      }
    });
    this.printList.push(printDataes);

    this.printMaxPage = Object.keys(this.printList).length - 1;
    this.printCurPage = this.printStartPage;
    this.printData = this.printList[this.printCurPage];
    // 印刷画面ヘッダー部用データ作成
    this.printHeader = new Kanri();
    this.setHeader();

  }

  /*
  * 全件印刷ボタン
  * 印刷ダイアログ起動時の初期化処理でGETした印刷データ(Injectされたthis.data)を
  * バックエンドに送信 バックエンド側で帳票分けるOnInit内と同じ処理を行っている
  */
  public printAll() {
    // 印刷前メッセージ
    const message = ['チェックシートをダウンロードします'];
    const msg = {
      title: '',
      message: message,
    };
    this.msgAndPrintAll(msg);
    //this.kanriService.checkSheetPrint(this.data);
  }

  /*
  * 個別印刷ボタン
  *
  */
  public printSelect() {
    // 印刷前メッセージ
    const message = ['チェックシートをダウンロードします'];
    const msg = {
      title: '',
      message: message,
    };
    this.msgAndPrintSelect(msg); 
    //this.kanriService.checkSheetPrint(this.printData);
  }
  /*
  * 左向きボタン処理　ページ戻り
  */
  public backPage() {
    if (this.printCurPage > this.printStartPage) {
      this.printCurPage -= 1;
      this.printData = this.printList[this.printCurPage];
      this.setHeader();
    }
  }

  /*
  * 右向きボタン処理　ページ送り
  */
  public forwardPage() {
    if (this.printCurPage < this.printMaxPage) {
      this.printCurPage += 1;
      this.printData = this.printList[this.printCurPage];
      this.setHeader();
    }
  }

  /*
  * 印刷画面ヘッダー部用データセット
  */
  private setHeader() {
    this.printHeader.tantousha = this.printData[0].tantousha;
    this.printHeader.hokengaisha = this.printData[0].hokengaisha;
    this.printHeader.hokenTantou = this.printData[0].hokenTantou;
    this.printHeader.dlvry = this.printData[0].dlvry;
  }

  /*
  *  いいえボタン処理 キャンセルダイアログ閉じる
  */
  cancel() {
    this.dialog.close();
  }

  /*
  * 印刷前メッセージ後に全件印刷処理
  * printAll
  */
  public msgAndPrintAll(msg: Msg) {
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
        this.kanriService.checkSheetPrint(this.data);
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  * 印刷前メッセージ後に個別印刷処理
  * printSelect
  */
  public msgAndPrintSelect(msg: Msg) {
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
        this.kanriService.checkSheetPrint(this.printData);
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
