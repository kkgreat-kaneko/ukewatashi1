import { Component, ViewChild, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { TantoushaService } from '../../service/tantousha.service';
import { Const } from '../../class/const';
import { Tantousha } from '../../class/tantousha';

@Component({
  selector: 'app-shinseisha-modal',
  templateUrl: './shinseisha-modal.component.html',
  styleUrls: ['./shinseisha-modal.component.css']
})
export class ShinseishaModalComponent implements OnInit {
  message: string;  // エラーメッセージ
  kaishaList = [    // 会社選択リスト用 ログインユーザーより動的変更?
    { label: Const.JLX_HOKEN, value: Const.JLX_HOKEN},
    { label: Const.JLX_HS_HOKEN, value: Const.JLX_HS_HOKEN}
  ];
  selected = Const.JLX_HOKEN;   // 会社選択セレクト値 ログインユーザーより動的変更?
  // selected: string;
  formGroup: FormGroup;
  kaisha = new FormControl(Const.JLX_HOKEN);

  displayColumns = ['select', 'shimei', 'busho', 'kubun'];  // データテーブル列要素
  dataSource: MatTableDataSource<Tantousha>;      // データテーブル初期化
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator; // データテーブルページネーター参照変数 ページ送り部品

  /*
  *  申請者テーブルチェックボックス選択コレクションオブジェクト
  *  選択状態自体を管理する
  */
  selection = new SelectionModel<Tantousha>(false, []);
  /*
  * セレクション Changeイベント登録、Ovservalオブジェクト作成
  *  チェックボックス状態が変更になった時、イベントがObserval発行
  *  ngOninit処理でsubscribe
  */
  private cbEmmiter = this.selection.onChange.asObservable();

  constructor(private dialog: MatDialogRef<ShinseishaModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Tantousha,
              private fb: FormBuilder,
              private tantoushaService: TantoushaService,
  ) { }

  ngOnInit() {
    // this.selected = Const.JLX_HS_HOKEN; //ログインユーザーより動的に変更？
    this.formGroup = this.fb.group({
      kaisha: this.kaisha
    });
    this.getInitList();
    /*
    *  checkBoxのselected契機で申請者テーブル選択データ保持serviceに選択されたselectItemを登録
    *  ShinseishaTableServiceが呼び出しから利用される
    */
    this.cbEmmiter.subscribe(cb => {
      if (cb.source.selected.length > 0) {
        // this.shinseishaService.selected(cb.source.selected[0]);
        this.data = cb.source.selected[0];
      } else {
        // this.shinseishaService.deSelected();
        this.data = null;
      }
    });
  }

  /*
  * 申請者選択一覧 データテーブル初期化
  *
  */
  public getInitList() {
    this.tantoushaService.getListByKaisha(this.selected)
    .then(res => {
      this.dataSource = new MatTableDataSource<Tantousha>(res);
      this.dataSource.paginator = this.paginator;
      // console.log(Object.keys(res).length);
    })
    .catch(err => {
      console.log(`login fail: ${err}`);
      this.message = 'データの取得に失敗しました。';
    })
    .then(() => {
      // anything finally method
    });
  }

  selectKaisha() {
    console.log(this.formGroup.value.kaisha);
    this.selected = this.formGroup.value.kaisha;
    this.getInitList();
  }

  /*
  * 閉じるボタン
  * 呼び出し元にデータを返す
  * 返すデータTantoushaクラス担当者データ型
  * 選択した申請者情報
  */
  close() {
    this.dialog.close(this.data);
  }
}
