import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { Shorui } from '../../class/shorui';
import { ShoruiService } from '../../service/shorui.service';
import { resetFakeAsyncZone } from '@angular/core/testing';

@Component({
  selector: 'app-mst-shorui',
  templateUrl: './mst-shorui.component.html',
  styleUrls: ['./mst-shorui.component.css']
})
export class MstShoruiComponent implements OnInit {
  message: string;                                                      // エラーメッセージ
  selectedShorui: Shorui;                                               // 一覧選択データ用
  
  displayColumns = [                                                    // 一覧列ヘッダ定義 select--->チェックBox列
    'select', 'shorui'];
  dataSource: MatTableDataSource<Shorui>;                               // 書類一覧データソース
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;     // 一覧ページネーター参照変数 ページ送り部品
  @ViewChild(MatSort, {static: true}) sort: MatSort;                    // 一覧ソート
  selection = new SelectionModel<Shorui>(false, []);                    // 一覧選択クラス false設定は単一選択のみ(true複数選択可)
  /*
  *  セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  selection
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();

  formGroup: FormGroup;                                                  // フォームグループ、以下フォームコントロール初期化
  shorui = new FormControl('');                                          // 書類

  constructor(private router: Router,
              private fb: FormBuilder,
              private popupAlertDialog: MatDialog,
              private shoruiService: ShoruiService,
  ) { }

  ngOnInit() {
    /* ブラウザ戻るボタン禁止 */
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
      history.go(1);
    });
        
    this.setFormGroup();
    this.getAllList();

    /*
    *  checkBoxのselected契機で書類一覧の選択データを保持する。selectedShorui変数に選択されたselectItemを登録
    *  selectedShorui変数が編集・削除のボタンから利用される
    *  選択、選択解除によってデータ保持リセット行う
    *  一覧は単一選択のみ可、selectedShorui変数にセットされれた選択データ単一用、解除する処理
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.selectedShorui = cb.source.selected[0];
        this.shorui.setValue(this.selectedShorui.shorui);
      } else {
        this.selectedShorui = null;
        this.formGroup.reset();
      }
    });
  }

  /*
  * フォームグループセット処理
  */
  public setFormGroup() {
    this.formGroup = this.fb.group({                          // フォームグループ初期化
      shorui: this.shorui,                                    // 書類
    });
  }

  /*
  *  書類一覧データ取得
  *  全書類検索をバックエンドと通信
  *  
  */
  public getAllList() {
    this.shoruiService.getAllList()
    .then(res => {
      this.dataSource = new MatTableDataSource<Shorui>(res);
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
    let shorui = this.formGroup.value.shorui;                                        // 書類必須項目
      if (!shorui) {
        const message = ['書類を入力してください。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }

    // DB検索処理 書類の重複チェック--->OKならDB登録処理
    this.shoruiService.getByShorui(shorui)
    .then(res => {
      if (res.length > 0) {
        const message = ['書類: ' + shorui + ' は既に登録されています。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;                                                                       // MSG出力後、中断して戻る
      } else {
        this.selectedShorui = new Shorui();
        this.selectedShorui.shorui = this.formGroup.value.shorui;                       // 書類 必須項目
        
        // DB登録処理
        this.shoruiService.create(this.selectedShorui)
        .then(res => {
          const message = ['書類: ' + res.shorui + 'を登録しました。']
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
    if (this.selectedShorui) {
      let shorui = this.formGroup.value.shorui;                                        // 書類必須項目
        if (!shorui) {
          const message = ['書類を入力してください。']
            const msg = {
              title: '',
              message: message,
            };
            this.showAlert(msg);
            return 0;
        }

      // DB検索処理 書類の重複チェック--->OKならDB更新処理
      this.shoruiService.getByShorui(shorui)
      .then(res => {
        if (res.length > 0) {
          const message = [`書類: ${shorui} は既に登録されています。`]
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;                                                                     // MSG出力後、中断して戻る
        } else {
          const beforeShorui = this.selectedShorui.shorui;
          // 更新フォーム値セット Idはそのまま
          this.selectedShorui.shorui = this.formGroup.value.shorui;
          // DB編集更新処理
          this.shoruiService.update(this.selectedShorui)
          .then(res => {
            const message = ['書類: ' + beforeShorui + 'を' + res.shorui, 'に変更しました。']
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
    if (this.selectedShorui) {
      if (this.formGroup.value.shorui !== this.selectedShorui.shorui) {
        const message = ['削除実行は書類の変更ができません。', '再度一覧から選択してから行ってください。']      // 新仕様　削除実行時は書類の変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }
      // DB削除処理
      this.shoruiService.delete(this.selectedShorui.id)
      .then(res => {
        if (res) {
          const message = [`書類: ${this.selectedShorui.shorui} を削除しました。`]
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
    this.selectedShorui = null;
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
