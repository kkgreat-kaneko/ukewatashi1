import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { Kubun } from '../../class/kubun';
import { KubunService } from '../../service/kubun.service';

@Component({
  selector: 'app-mst-kubun',
  templateUrl: './mst-kubun.component.html',
  styleUrls: ['./mst-kubun.component.css']
})
export class MstKubunComponent implements OnInit {
  message: string;                                                      // エラーメッセージ
  selectedKubun: Kubun;                                                 // 一覧選択データ用
  
  displayColumns = [                                                    // 一覧列ヘッダ定義 select--->チェックBox列
    'select', 'kubun'];
  dataSource: MatTableDataSource<Kubun>;                                // 区分一覧データソース
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;     // 一覧ページネーター参照変数 ページ送り部品
  @ViewChild(MatSort, {static: true}) sort: MatSort;                    // 一覧ソート
  selection = new SelectionModel<Kubun>(false, []);                     // 一覧選択クラス false設定は単一選択のみ(true複数選択可)
  /*
  *  セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  selection
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();

  formGroup: FormGroup;                                                  // フォームグループ、以下フォームコントロール初期化
  kubun = new FormControl('');                                           // 区分

  constructor(private router: Router,
              private fb: FormBuilder,
              private popupAlertDialog: MatDialog,
              private kubunService: KubunService,
  ) { }

  ngOnInit() {
    this.setFormGroup();
    this.getAllList();

    /*
    *  checkBoxのselected契機で区分一覧の選択データを保持する。SelectedKubun変数に選択されたselectItemを登録
    *  SelectedKubun変数が編集・削除のボタンから利用される
    *  選択、選択解除によってデータ保持リセット行う
    *  一覧は単一選択のみ可、SelectedKubun変数にセットされれた選択データ単一用、解除する処理
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.selectedKubun = cb.source.selected[0];
        this.kubun.setValue(this.selectedKubun.kubun);
      } else {
        this.selectedKubun = null;
        this.formGroup.reset();
      }
    });
  }

  /*
  * フォームグループセット処理
  */
  public setFormGroup() {
    this.formGroup = this.fb.group({                          // フォームグループ初期化
      kubun: this.kubun,                                      // 区分
    });
  }

  /*
  *  区分一覧データ取得
  *  全区分検索をバックエンドと通信
  *  
  */
  public getAllList() {
    this.kubunService.getAllList()
    .then(res => {
      this.dataSource = new MatTableDataSource<Kubun>(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
  *  登録実行ボタン
  */
  public create() {
    let kubun = this.formGroup.value.kubun;                                         // 区分必須項目
      if (!kubun) {
        const message = ['区分を入力してください。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }

    // DB検索処理 区分の重複チェック--->OKならDB登録処理
    this.kubunService.getByKubun(kubun)
    .then(res => {
      if (res.length > 0) {
        const message = ['区分: ' + kubun + ' は既に登録されています。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;                                                                               // MSG出力後、中断して戻る
      } else {
        this.selectedKubun = new Kubun();
        this.selectedKubun.kubun = this.formGroup.value.kubun;                                  // 区分 必須項目
        
        // DB登録処理
        this.kubunService.create(this.selectedKubun)
        .then(res => {
          const message = ['区分: ' + res.kubun + 'を登録しました。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          this.clear();
        })
        .catch(err => {
          console.log(`login fail: ${err}`);
          this.message = 'データの取得に失敗しました。';
        })
        .then(() => {
          // anything finally method
        });
      } 
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
  *  更新ボタン
  */
  public update() {
    if (this.selectedKubun) {
      let kubun = this.formGroup.value.kubun;                                         // 区分必須項目
        if (!kubun) {
          const message = ['区分を入力してください。']
            const msg = {
              title: '',
              message: message,
            };
            this.showAlert(msg);
            return 0;
        }

      // DB検索処理 区分の重複チェック--->OKならDB更新処理
      this.kubunService.getByKubun(kubun)
      .then(res => {
        if (res.length > 0) {
          const message = ['区分: ' + kubun + ' は既に登録されています。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;                                                                               // MSG出力後、中断して戻る
        } else {
          const beforeKubun = this.selectedKubun.kubun;
          // 更新フォーム値セット Idはそのまま
          this.selectedKubun.kubun = this.formGroup.value.kubun;
          // DB編集更新処理
          this.kubunService.update(this.selectedKubun)
          .then(res => {
            const message = ['区分: ' + beforeKubun + 'を' + res.kubun, 'に変更しました。']
            const msg = {
              title: '',
              message: message,
            };
            this.showAlert(msg);
            this.clear();
          })
          .catch(err => {
            console.log(`login fail: ${err}`);
            this.message = 'データの取得に失敗しました。';
          })
          .then(() => {
            // anything finally method
          });
        } 
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
    }
  }

  /*
  *  削除ボタン
  */
  public delete() {
    if (this.selectedKubun) {
      if (this.formGroup.value.kubun !== this.selectedKubun.kubun) {
        const message = ['削除実行は区分の変更ができません。', '再度一覧から選択してから行ってください。']      // 新仕様　削除実行時は区分の変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }
      // DB削除処理
      this.kubunService.delete(this.selectedKubun.id)
      .then(res => {
        if (res) {
          const message = [`区分: ${this.selectedKubun.kubun} を削除しました。`]
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          this.clear();
        }
      })
      .catch(err => {
        console.log(`login fail: ${err}`);
        this.message = 'データの取得に失敗しました。';
      })
      .then(() => {
        // anything finally method
      });
    }
  }

  /*
  *  画面を初期状態に戻す
  */
  public clear() {
  this.selectedKubun = null;
  this.formGroup.reset();
  this.selection.clear();
  this.getAllList();
  }

  /*
  *  閉じるボタン
  *  メイン画面開く
  */
  public close() {
    this.router.navigate(['/maintenance']);
  }

  /*
  * 警告メッセージ
  * 引数インターフィイスMsg　ソース最後に宣言
  */
  public showAlert(msg: Msg) {
    const dialogRef = this.popupAlertDialog.open(PopupAlertComponent, {
      data: msg,
      disableClose: true,
      restoreFocus: false,                  // ダイアログ閉じた後に呼び出し元ボタンへのフォーカス無効
      // autoFocus: false,                  // ダイアログ開いた時の自動フォーカス無効
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
