import { Injectable } from '@angular/core';
import { Kanri } from '../class/kanri';

/*
* メイン画面受渡書類一覧(データソーステーブル)の選択イベントから発生した選択行のレコードを管理するサービス
* 選択された行データを保持して、編集・削除・承認・チェックシート印刷処理がサービスを利用する
*/

@Injectable({
  providedIn: 'root'
})
export class KanriTableService {
  private selectedRecord: Kanri;
  private selectedRecords: Kanri[];

  constructor() { }

  /*
  * 一覧から選択された行処理 選択されたKanriデータを保持
  */
  public selected(kanri: Kanri) {
    this.selectedRecord = kanri;
  }

  /*
  * 選択されているレコードKanriデータを返す
  */
  public getSelected(): Kanri {
    return this.selectedRecord;
  }

  /*
  * 選択解除された時処理 選択データをNullセット
  */
  public deSelected() {
    this.selectedRecord = null;
  }

  /*
  * 選択された全レコードを保持
  */
  public selectedAll(kanries: Kanri[]) {
    // console.log(this.selectedRecords); // test line
    this.selectedRecords = kanries;
  }

  /*
  * 保持している選択全レコードKanriデータ配列を返す
  */
  public getSelectedAll(): Kanri[] {
    return this.selectedRecords;
  }

  /*
  * 選択全解除された時の処理
  */
  public deSelectedAll() {
    this.selectedRecords = null;
  }
}
