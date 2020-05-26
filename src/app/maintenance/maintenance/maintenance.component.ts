import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { HokengaishaListOrderComponent } from '../hokengaisha-list-order/hokengaisha-list-order.component';
import { KubunOrderComponent } from '../kubun-order/kubun-order.component';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {

  constructor(private router: Router,
              private dialog: MatDialog,
    ) { }

  ngOnInit() {
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
  *  閉じるボタン
  *  メイン画面開く
  */
  public close() {
    this.router.navigate(['/main']);
  }
}
