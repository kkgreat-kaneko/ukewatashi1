import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { SessionService } from '../../service/session.service';
import { PopupAlertComponent } from '../../popup/popup-alert/popup-alert.component';
import { HokengaishaList } from '../../class/hokengaisha-list';
import { HokengaishaListService } from '../../service/hokengaisha-list.service';

@Component({
  selector: 'app-mst-hokengaisha-list',
  templateUrl: './mst-hokengaisha-list.component.html',
  styleUrls: ['./mst-hokengaisha-list.component.css']
})
export class MstHokengaishaListComponent implements OnInit {
  message: string;                                                      // エラーメッセージ
  selectedHokengaisha: HokengaishaList                                  // 一覧選択データ用
  
  displayColumns = [                                                    // 一覧列ヘッダ定義 select--->チェックBox列
    'select', 'hokengaisha'];
  dataSource: MatTableDataSource<HokengaishaList>;                      // 保険会社一覧データソース
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;     // 一覧ページネーター参照変数 ページ送り部品
  @ViewChild(MatSort, {static: true}) sort: MatSort;                    // 一覧ソート
  selection = new SelectionModel<HokengaishaList>(false, []);           // 一覧選択クラス false設定は単一選択のみ(true複数選択可)
  /*
  *  セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  selection
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();

  formGroup: FormGroup;                                                  // フォームグループ、以下フォームコントロール初期化
  hokengaisha = new FormControl('');                                     // 保険会社名

  constructor(private router: Router,
              private sessionService: SessionService,
              private hokengaishaListService: HokengaishaListService,
              private fb: FormBuilder,
              private popupAlertDialog: MatDialog,
  ) { }

  ngOnInit() {
    /* ブラウザ戻るボタン禁止 */
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
      history.go(1);
    });
    
    this.setFormGroup();
    this.getHokengaishaList();

    /*
    *  checkBoxのselected契機で担当者一覧の選択データを保持する。SelectedHokengaisha変数に選択されたselectItemを登録
    *  SelectedHokengaisha変数が編集・削除のボタンから利用される
    *  選択、選択解除によってデータ保持リセット行う
    *  一覧は単一選択のみ可、SelectedHokengaisha変数にセットされれた選択データ単一用、解除する処理
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        this.selectedHokengaisha = cb.source.selected[0];
        this.hokengaisha.setValue(this.selectedHokengaisha.hokengaisha);
      } else {
        this.selectedHokengaisha = null;
        this.formGroup.reset();
      }
    });
  }

  /*
  * フォームグループセット処理
  */
  public setFormGroup() {
    this.formGroup = this.fb.group({                          // フォームグループ初期化
      hokengaisha: this.hokengaisha,                          // 保険会社名
    });
  }

  /*
  *  保険会社一覧データ取得
  *  全保険会社検索をバックエンドと通信
  *  
  */
  public getHokengaishaList() {
    this.hokengaishaListService.getAllList()
    .then(res => {
      this.dataSource = new MatTableDataSource<HokengaishaList>(res);
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
    let hokengaisha = this.formGroup.value.hokengaisha;                                         // 保険会社必須項目
      if (!hokengaisha) {
        const message = ['会社名を入力してください。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;
      }

    // DB検索処理 保険会社名の重複チェック--->OKならDB登録処理
    this.hokengaishaListService.getByHokengaishaName(hokengaisha)
    .then(res => {
      if (res.length > 0) {
        const message = ['保険会社: ' + hokengaisha + ' は既に登録されています。']
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;                                                                               // MSG出力後、中断して戻る
      } else {
        this.selectedHokengaisha = new HokengaishaList();
        this.selectedHokengaisha.hokengaisha = this.formGroup.value.hokengaisha;                // 保険会社 必須項目
        
        // DB登録処理
        this.hokengaishaListService.create(this.selectedHokengaisha)
        .then(res => {
          const message = ['保険会社: ' + res.hokengaisha + 'を登録しました。']
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
    if (this.selectedHokengaisha) {
      let hokengaisha = this.formGroup.value.hokengaisha;                                         // 保険会社必須項目
        if (!hokengaisha) {
          const message = ['会社名を入力してください。']
            const msg = {
              title: '',
              message: message,
            };
            this.showAlert(msg);
            return 0;
        }

      // DB検索処理 保険会社名の重複チェック--->OKならDB更新処理
      this.hokengaishaListService.getByHokengaishaName(hokengaisha)
      .then(res => {
        if (res.length > 0) {
          const message = ['保険会社: ' + hokengaisha + ' は既に登録されています。']
          const msg = {
            title: '',
            message: message,
          };
          this.showAlert(msg);
          return 0;                                                                               // MSG出力後、中断して戻る
        } else {
          const beforeHokengaishaName = this.selectedHokengaisha.hokengaisha;
          // 更新フォーム値セット Idはそのまま
          this.selectedHokengaisha.hokengaisha = this.formGroup.value.hokengaisha;
          // DB編集更新処理
          this.hokengaishaListService.update(this.selectedHokengaisha)
          .then(res => {
            const message = ['保険会社: ' + beforeHokengaishaName + 'を' + res.hokengaisha, 'に変更しました。']
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
    if (this.selectedHokengaisha) {
      if (this.formGroup.value.hokengaisha !== this.selectedHokengaisha.hokengaisha) {
        const message = ['削除実行は保険会社名の変更ができません。', '再度一覧から選択してから行ってください。']      // 新仕様　削除実行時は会社名の変更不可
        const msg = {
          title: '',
          message: message,
        };
        this.showAlert(msg);
        return 0;
      }
      // DB削除処理
      this.hokengaishaListService.delete(this.selectedHokengaisha.id)
      .then(res => {
        if (res) {
          const message = [`保険会社: ${this.selectedHokengaisha.hokengaisha} を削除しました。`]
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
  this.selectedHokengaisha = null;
  this.formGroup.reset();
  this.hokengaisha.reset();
  this.selection.clear();
  this.getHokengaishaList();
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

