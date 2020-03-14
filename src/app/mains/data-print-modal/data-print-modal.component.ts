import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { KanriService } from '../../service/kanri.service';
import { Kanri } from '../../class/kanri';

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
    this.kanriService.checkSheetPrint(this.data);
  }

  /*
  * 個別印刷ボタン
  *
  */
  public printSelect() {
    this.kanriService.checkSheetPrint(this.printData);
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


}
