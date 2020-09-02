import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { Kanri } from '../class/kanri';
import { Const } from '../class/const';

@Injectable({
  providedIn: 'root'
})
export class KanriDelService {
  res: any;

  constructor(private http: HttpClient, private session: SessionService) { }

  /*
  * メイン画面書類データ検索条件つきリスト用
  */
  public async getList(kanri: Kanri): Promise<Kanri[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kanridel/getlist', kanri, {headers: headers})
    .toPromise();
    return this.res;
  }
}
