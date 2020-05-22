import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HokengaishaListService } from '../../service/hokengaisha-list.service';
import { HokengaishaList } from '../../class/hokengaisha-list';
import { TantoushaService } from '../../service/tantousha.service';
import { SessionService } from '../../service/session.service';
import { Tantousha } from '../../class/tantousha';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';

@Component({
  selector: 'app-hokengaisha-list-order',
  templateUrl: './hokengaisha-list-order.component.html',
  styleUrls: ['./hokengaisha-list-order.component.css']
})
export class HokengaishaListOrderComponent implements OnInit {
  message: string;                                          // エラーメッセージ用
  hokengaishaList: HokengaishaList[];                       // 保険会社選択リスト用
  hokengaishaOrder: string;                                 // 保険会社並び順IDカンマ区切り文字列　担当者テーブルへ保存データ
  loginUser: Tantousha;                                     // ログインユーザー情報
  tantousha: Tantousha;                                     // 更新用(ログインユーザーの保険会社表示順更新用)


  constructor(private dialog: MatDialogRef<HokengaishaListOrderComponent>,
              private hokengaishaListService: HokengaishaListService,
              private tantoushaService: TantoushaService,
              private sessionService: SessionService,
              private popupAlertDialog: MatDialog
    ) { }

  ngOnInit() {
    this.loginUser = this.sessionService.setLoginUser();                  // ログインユーザー情報セット
    this.getHokengaishaList();                                            // 保険会社リスト 初期化
  }

  /*
  * ドロップ処理
  * リスト並び順が変更されると
  * 保険会社IDを並び順にうカンマ区切り形式データとしてグローバル変数(hokengaishaOrder)に保存
  */
  drop(event: CdkDragDrop<HokengaishaList[]>) {
    moveItemInArray(this.hokengaishaList, event.previousIndex, event.currentIndex);
    this.hokengaishaOrder = this.createOrder(this.hokengaishaList);
  }

  /*
  * 並び順IDをカンマ区切り文字列変換
  */
  createOrder(hokengaishaList: HokengaishaList[]): string {
    let order = '';
    for( let hokengaisha of hokengaishaList ){
      order += hokengaisha.id + ',';
    }
    return order.slice(0, -1);
  }

  /*
  * メンテナンス表示順文字列データを数字配列に変換、並び順を未設定の場合はNULLを返す--->NULLの時changeHokengaishaOrderで条件処理
  * カンマ区切りID並び順文字列データを数字配列に変換
  */
  formatHokengaishaOrder(hokengaishaOrder: string): number[] {
    if (typeof hokengaishaOrder === "undefined") {
      return null;
    }
    const arr = hokengaishaOrder.split(',');
    return arr.map( sid => parseInt(sid, 10) );
  }

  /*
  *  保険会社並び順変更処理ファンクション
  *  担当者が保持している並びに変更
  */
  changeHokengaishaOrder(list: HokengaishaList[], order: number[]): HokengaishaList[] {
    // 並び順設定がない時NULL マスタ検索id昇順リストを返す
    if (!order) {
      return list;
    }
    // 並び順指定に変更
    const hokengaishaList: HokengaishaList[] = [];
    for ( let num of order ) {
      for ( let hokengaisha of list ) {
        if ( num === hokengaisha.id ) {
          hokengaishaList.push(hokengaisha);
        }
      }
    }
    // マスタ最新データとの差異を調整 並び順後のデータに含まれてなければ、最新書類をpushする
    for ( let hokengaisha of list )  {
      let notInclude = true;
      for ( let orderedHokengaisha of hokengaishaList ) {
        if (orderedHokengaisha.id === hokengaisha.id) {
          notInclude = false;
        }
      }
      if (notInclude) {
        hokengaishaList.push(hokengaisha);
      }
    }
    return hokengaishaList;
  }

  /*
  *  保険会社セレクト用データ取得
  *  全保険会社検索をバックエンドと通信　非同期処理を考慮して処理する
  */
  public getHokengaishaList() {
    this.hokengaishaListService.getAllList()
    .then(res => {
      //担当者の並び取得後、保険会社リストを担当者並びに変更
      this.tantoushaService.getByID(this.loginUser.userId)                  // ログインユーザー更新用データ初期化
      .then(tantousha => {
        this.tantousha = tantousha;
        this.hokengaishaOrder = this.tantousha.hokengaishaOrder;            // 保険会社並び順IDパイプ区切り文字列　初期化
        // ユーザー表示順に並び替え処理
        const order = this.formatHokengaishaOrder(this.hokengaishaOrder);
        this.hokengaishaList = this.changeHokengaishaOrder(res, order);
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
      
    })
    .catch(err => {
      console.log(`hokengaisha-list-order fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });
    
  }

  /*
  * 保険会社表示並び順　担当者テーブルに更新（ログインユーザーレコード) 
  */
  public updateHokengaishaOrder() {
    this.tantousha.hokengaishaOrder = this.hokengaishaOrder;

    this.tantoushaService.update(this.tantousha)                  // ログインユーザー更新用データ初期化
    .then(res => {
      this.tantousha = res;
      let message = ['表示順の並び替えを登録しました。'];
      const msg: Msg = {
        title: '登録完了',
        message: message,
      }
      this.showMsg(msg);
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
  * メッセージダイアログ　操作完了メッセージ
  */
  public showMsg(msg: Msg) {
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