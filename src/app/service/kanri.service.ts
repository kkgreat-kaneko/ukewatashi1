import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { Kanri } from '../class/kanri';
import { Const } from '../class/const';
import { RequestDto } from '../class/request-dto';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class KanriService {
  res: any;
  reuseKanri: Kanri;
  chcekSheetPdf: Blob;

  constructor(private http: HttpClient, private session: SessionService, private sanitizer: DomSanitizer) {}

  /*
  * ログイン後チェック処理３　不備書類検索
  * 検索条件：入力担当者 = ログインID、status = 3
  */
  public async getInitChkNotChk(kanri: Kanri): Promise<RequestDto> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getinitchknotchk', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * ログイン後チェック処理３　不備書類検索
  * 検索条件：入力担当者 = ログインID、status = 3
  */
  public async getInitChkFubi(kanri: Kanri): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getinitchkfubi', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * メイン画面書類データ初期リスト検索用
  */
  public async getInitList(kanri: Kanri): Promise<Kanri[]> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/getinitlist', kanri, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getinitlist', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * メイン画面書類データ検索条件つきリスト用
  */
  public async getList(kanri: Kanri): Promise<Kanri[]> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/getlist', kanri, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getlist', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 書類データ新規登録用
  */
  public async createKanri(kanri: Kanri): Promise<Kanri> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/createkanri', kanri, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/createkanri', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 書類データ編集更新登録用
  */
  public async updateKanri(kanri: Kanri): Promise<Kanri> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/updatekanri', kanri, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/updatekanri', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 書類データ削除（１件)用
  */
  public async deleteKanri(kanri: Kanri): Promise<number> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/deletekanri', kanri, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/deletekanri', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 書類データ一括承認・一括承認戻し用
  */
  public async approveKanries(dto: ApproveData): Promise<number> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/approvekanries', dto, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/approvekanries', dto, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 書類データ単一承認・単一承認戻し用
  */
  public async approveKanri(kanri: Kanri): Promise<number> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/approvekanri', kanri, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/approvekanri', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 書類データ新規登録用に固定値のみセットする処理
  */
  public createInitData(data: Kanri): Kanri {
    // 固定値セット
    data.status = 0;                                              // 処理ステータス
    data.statusApp = 0;                                           // 承認ステータス
    data.okng = 0;                                                // 区分OK/NG
    data.sakuseibi = this.session.getToday();                     // 作成日 Viewで使用する為セットするが転記ボタンクリック時に再度セットしている
    //data.saishuHenshubi = this.session.getToday();              // 最終編集日 転記ボタン/編集完了ボタン時セットに変更
    // 担当者固定値セット
    data.tantoushaUserId = sessionStorage.getItem('userId');      // 担当者ユーザーID
    data.tantousha = sessionStorage.getItem('shimei');            // 担当者氏名
    data.tantoushaKaisha = sessionStorage.getItem('kaisha');      // 担当者会社名
    data.tantoushaTeam = sessionStorage.getItem('busho');         // 担当者チーム名
    // 仮処理 Entity NotNull対応 空文字''の登録不可
    // if (!data.tantoushaTeam) { data.tantoushaTeam = ' '; }
    // 初期化情報セット（動的変更有り)
    data.shinseishaUserId = sessionStorage.getItem('userId');     // 申請者ID初期化
    data.shinseisha = sessionStorage.getItem('shimei');           // 申請者氏名初期化
    data.shinseishaKaisha = sessionStorage.getItem('kaisha');     // 申請者会社名
    data.shinseishaTeam = sessionStorage.getItem('busho');        // 申請者チーム名

    data = this.initShorui(data);                                 // 添付書類値初期化
    return data;
  }

  /*
  *  登録更新用添付書類値初期化
  */
  public initShorui(data: Kanri): Kanri {
    data.shorui1 = '';
    data.shorui2 = '';
    data.shorui3 = '';
    data.shorui4 = '';
    data.shorui5 = '';
    data.shorui6 = '';
    data.shorui7 = '';
    data.shorui8 = '';
    data.shorui9 = '';
    data.shorui10 = '';

    data.okng1 = Const.SHORUI_OK;
    data.okng2 = Const.SHORUI_OK;
    data.okng3 = Const.SHORUI_OK;
    data.okng4 = Const.SHORUI_OK;
    data.okng5 = Const.SHORUI_OK;
    data.okng6 = Const.SHORUI_OK;
    data.okng7 = Const.SHORUI_OK;
    data.okng8 = Const.SHORUI_OK;
    data.okng9 = Const.SHORUI_OK;
    data.okng10 = Const.SHORUI_OK;

    return data;
  }

  /*
  * 新規登録繰り返し処理用
  * データ転記時に入力データ繰り返し再利用-->保持
  */
  public setReuseKanri(data: Kanri) {
    this.reuseKanri = data;
  }

  /*
  * 新規登録繰り返しボタン対応
  * 転記時に保持した直前の入力データを返す
  */
  public getReuseKanri(): Kanri {
    return this.reuseKanri;
  }

  /*
  *  メイン画面チェックシート印刷画面起動時にコール
  *  印刷ダイアログ表示処理前のデータ初期化 データNull時は印刷ダイアログ表示せずに警告メッセージを表示する判別にも使用
  */
  public async checkSheetPrintInit(kanri: Kanri): Promise<Kanri[]>  {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/getchecksheet', kanri, { headers: headers })
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getchecksheet', kanri, { headers: headers })
    .toPromise();
    return this.res;
  }

  /*
  *   チェックシート印刷画面全件印刷・個別印刷
  *
  */
  public checkSheetPrint(printList: Kanri[]) {
    const headers = this.session.setTkHeaders();
    //this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/kanri/printchecksheet', printList, { responseType: 'blob', headers: headers })
    this.http.post( Const.WWW_ROOT + 'kanri/printchecksheet', printList, { responseType: 'blob', headers: headers })
    .subscribe(
      response => {
        this.chcekSheetPdf = new Blob([response], { type: 'application/pdf' } );
        /*
        * クライアントにダウンロードする場合 Filesaver使用
        */
        // saveAs(this.chcekSheetPdf, 'ukeTest1.pdf'); // pdfダウンロード取りやめ

        // ゲットしたBlobデータ(PDF)を別ウィンドウでダウンロードせず開く
        const url1 = URL.createObjectURL(this.chcekSheetPdf);
        // const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url); // NG
        if (window.navigator.msSaveBlob) {
          saveAs(this.chcekSheetPdf, 'ukeTest1.pdf');
        } else {
          window.open(url1);
        }
      },
      error => {
        console.log('error print checkSheet');
      }
    );
  }

  /*
  * チェックシート印刷処理
  * テスト段階
  */
  /*
  public checkSheetPrintTest() {
    const headers = this.session.setTkHeaders();

    this.http.get('http://192.168.1.11:8080/Ukewatashi/ws/kanri/testpdf', { responseType: 'blob', headers: headers })
    .subscribe(
      response => {
        this.chcekSheetPdf = new Blob([response], { type: 'application/pdf' } ); */
        /*
        * クライアントにダウンロードする場合 Filesaver使用
        */
        // saveAs(this.chcekSheetPdf, 'ukeTest1.pdf'); // pdfダウンロード取りやめ

        // ゲットしたBlobデータ(PDF)を別ウィンドウでダウンロードせず開く
      /*  const url1 = URL.createObjectURL(this.chcekSheetPdf);
        // const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url); // NG
        if (window.navigator.msSaveBlob) {
          saveAs(this.chcekSheetPdf, 'ukeTest1.pdf');
        } else {
          window.open(url1);
        }
      },
      error => {
        console.log('error print checkSheet');
      }
    );
  }
  */

  /*
  *  チェックシート初期化  テスト
  */
  /*
  public async checkSheetPrintInitTest() {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get('http://192.168.1.11:8080/Ukewatashi/ws/kanri/test', { headers: headers })
    .toPromise();
    return this.res;
  }
  */

  /*
  *   確認書印刷前、件数チェック処理
  */
  public async chkHokenConfirm(kanri: Kanri): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/chkhokenconfirm', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *   確認書印刷JLX画面
  */
  public printHokenConfirm(kanri: Kanri) {
    const headers = this.session.setTkHeaders();
    this.http.post( Const.WWW_ROOT + 'kanri/printhokenconfirm', kanri, { responseType: 'blob', headers: headers })
    .subscribe(
      response => {
        const hokenConfirmPdf = new Blob([response], { type: 'application/pdf' } );
        // ゲットしたBlobデータ(PDF)を別ウィンドウでダウンロードせず開く
        const url1 = URL.createObjectURL(hokenConfirmPdf);
        if (window.navigator.msSaveBlob) {
          saveAs(hokenConfirmPdf, 'hokenConfirm.pdf');        // IEの時はBlobデータが開けないのでダウンロードする
        } else {
          window.open(url1);
        }
      },
      error => {
        console.log('error print checkSheet');
      }
    );
  }

  /*
  *   確認書印刷保険会社画面
  *   同期処理が必要の為、JLX画面用と異なる。(処理後の一覧更新のタイミングが異なる為)
  */
  public async printHokenConfirm2(kanri: Kanri): Promise<any> {
    const headers = this.session.setTkHeaders();
    const res = await this.http.post( Const.WWW_ROOT + 'kanri/printhokenconfirm', kanri, { responseType: 'blob', headers: headers })
    .toPromise();
    return res;
  }

  /*
  *   確認書「再印刷」保険会社画面　再印刷データ指定
  *   同期処理が必要の為、JLX画面用と異なる。(処理後の一覧更新のタイミングが異なる為)
  */
  public async rePrintHokenConfirm(kanri: Kanri): Promise<any> {
    const headers = this.session.setTkHeaders();
    const res = await this.http.post( Const.WWW_ROOT + 'kanri/reprinthokenconfirm', kanri, { responseType: 'blob', headers: headers })
    .toPromise();
    return res;
  }

  /*
  * 保険会社メイン画面 書類一覧用
  */
  public async getListByHokengaisha(kanri: Kanri): Promise<Kanri[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getlistbyhokengaisha', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 保険会社メイン画面 初期化チェック処理
  */
  public async getCheckByHokengaisha(kanri: Kanri): Promise<RequestDto[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/getcheckbyhokengaisha', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社メイン画面 確認済みに戻す処理
  */
  public async undoStatusToOk(requestDto: RequestDto): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/undostatustook', requestDto, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社メイン画面 未確認に戻す処理
  */
  public async undoStatusToNot(requestDto: RequestDto): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanri/undostatustonot', requestDto, {headers: headers})
    .toPromise();
    return this.res;
  }

}

/*----------------------------------------------------------
*  承認データリクエストDTOインターフェイス
*/
export interface ApproveData {
  setApprove: boolean;
  kanriIds: number[];
  shouninsha: string;       // 承認者
  shouninbi: string;        // 承認日
  mishouninsha: string;     // 未承認者
  mishouninbi: string;      // 未承認日
  // saishuHenshubi: string;
}
