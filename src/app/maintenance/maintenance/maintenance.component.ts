import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatTreeNestedDataSource } from '@angular/material';
import { Const } from '../../class/const';
import { Tantousha } from '../../class/tantousha';
import { TantoushaService } from '../../service/tantousha.service';
import { HokengaishaListOrderComponent } from '../hokengaisha-list-order/hokengaisha-list-order.component';
import { KubunOrderComponent } from '../kubun-order/kubun-order.component';
import { ShoruiOrderComponent } from '../shorui-order/shorui-order.component';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {
  message: string;
  loginUser: Tantousha;
  normalMode: boolean;                                        // 管理者メニューdisabled用フラグ

  constructor(private router: Router,
              private dialog: MatDialog,
              private tantoushaService: TantoushaService,
  ) { }

  ngOnInit() {
    this.getLoginTantousha();
  }

  /*
  *  ログイン担当者情報取得ファンクション
  */
  public getLoginTantousha() {
    let tantousha: Tantousha;
    this.tantoushaService.getLoginTantousha()
    .then(res => {
      this.loginUser = res;
      this.loginUser.kengen === Const.KENGEN_ALL ? this.normalMode = false : this.normalMode = true;
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
  *  担当者データボタン
  *  MstTantoushaComponentへ画面を遷移する
  */
  public showMstTantousha() {
    this.router.navigate(['/mst-tantousha']);
  }

  /*
  *  保険会社データボタン(保険会社担当)
  *  MstHokengaishaComponentへ画面遷移する
  */
  public showMstHokengaisha() {
    this.router.navigate(['/mst-hokengaisha']);
  }

  /*
  *  保険会社リストデータボタン(保険会社)
  *  MstHokengaishaListComponentへ画面遷移する
  */
  public showMstHokengaishaList() {
    this.router.navigate(['/mst-hokengaisha-list']);
  }

  /*
  *  区分リストボタン
  *  MstKubunComponentへ画面遷移する
  */
  public showMstKubun() {
    this.router.navigate(['/mst-kubun']);
  }

  /*
  *  保険会社リスト表示順ボタン
  * 
  */
  public showHokengaishaOrder() {
      const dialogRef = this.dialog.open(HokengaishaListOrderComponent, {
        disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
        restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
        autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
        height: '600px',
        minHeight: '600px',
        maxHeight: '600px',
        width: '600px',
      });
      // ダイアログ終了後処理
      dialogRef.afterClosed()
      .subscribe(
        data => {
          if (data) {
            // nothing
          }
        },
        error => {
          console.log('error');
        }
      );
  }

  /*
  *  区分表示順ボタン
  * 
  */
  public showKubunOrder() {
    const dialogRef = this.dialog.open(KubunOrderComponent, {
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
      height: '600px',
      minHeight: '600px',
      maxHeight: '600px',
      width: '600px',
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          // nothing
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  書類表示順ボタン
  * 
  */
  public showShoruiOrder() {
    const dialogRef = this.dialog.open(ShoruiOrderComponent, {
      disableClose: true,             // モーダル外クリック時画面を閉じる機能無効
      restoreFocus: false,            // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      autoFocus: false,               // ダイアログ開いた時の自動フォーカス無効
      height: '600px',
      minHeight: '600px',
      maxHeight: '600px',
      width: '600px',
    });
    // ダイアログ終了後処理
    dialogRef.afterClosed()
    .subscribe(
      data => {
        if (data) {
          // nothing
        }
      },
      error => {
        console.log('error');
      }
    );
  }

  /*
  *  閉じるボタン
  *  メイン画面開く
  */
  public close() {
    this.router.navigate(['/main']);
  }
}
