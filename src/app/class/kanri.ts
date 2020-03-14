/*
* Java Entity対応クラス
* 管理テーブル構造 プラス 検索用プロパティ
*/

export class Kanri {
  id: number;
  status: number;
  statusApp: number;
  dlvry: string;
  hokengaisha: string;
  hokenTantou: string;
  seihobun: number;
  seiho: string;
  shoukenbango: string;
  keiyakusha: string;
  kubun: string;
  okng: number;
  shoruiUmu: number;
  shorui1: string;
  okng1: number;
  shorui2: string;
  okng2: number;
  shorui3: string;
  okng3: number;
  shorui4: string;
  okng4: number;
  shorui5: string;
  okng5: number;
  shorui6: string;
  okng6: number;
  shorui7: string;
  okng7: number;
  shorui8: string;
  okng8: number;
  shorui9: string;
  okng9: number;
  shorui10: string;
  okng10: number;
  okShoruiIchiran: string;
  fubiShoruiIchiran: string;
  shoruiMaisu: number;
  bikou: string;
  hokenBikou: string;
  tantoushaUserId: string;
  tantousha: string;
  tantoushaKaisha: string;
  tantoushaTeam: string;
  shinseishaUserId: string;
  shinseisha: string;
  shinseishaKaisha: string;
  shinseishaTeam: string;
  kakuninsha: string;
  sakuseibi: string;
  saishuHenshubi: string;
  kakuninbi: string;
  saishuKakuninbi: string;
  sakujyoriyu: string;
  sakujyosha: string;
  shouninsha: string;
  shouninbi: string;
  mishouninsha: string;
  mishouninbi: string;
  limit: number;              // バックエンドへ検索条件用プロパティ
  userId: string;             // バックエンドへ検索条件用プロパティ
  kengen: number;             // バックエンドへ検索条件用プロパティ
  sKaisha: string[];          // バックエンドへ検索条件用プロパティ
  beforeId: number;           // バックエンドへ検索条件用プロパティ
  kubunInput: string;         // 繰り返しボタン処理で使用するデータ　区分手入力フォーム反映用
}
