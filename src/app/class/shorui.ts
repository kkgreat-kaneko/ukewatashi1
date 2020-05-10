import { NumberFormatStyle } from '@angular/common';

/*
* Java Entity対応クラス
* 書類テーブル構造 プラス 検索用プロパティ
*/
export class Shorui {
 id: number;
 shorui: string;
 okng: number;          // 編集登録用　書類名と不備情報をペアで保持する為
}
