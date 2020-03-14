import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionService } from './session.service';
import { Tantousha } from '../class/tantousha';
import { Const } from '../class/const';

@Injectable({
  providedIn: 'root'
})
export class TantoushaService {
  res: any;

  constructor(private http: HttpClient, private session: SessionService) {}

  /*
  * 全検索
  */
  public async findall(): Promise<Tantousha[]> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.get('http://192.168.1.11:8080/Ukewatashi/ws/tantousha', {headers: headers})
    this.res = await this.http.get( Const.WWW_ROOT + 'tantousha', {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 会社別社員検索
  *
  */
  public async getListByKaisha(kaisha: string) {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.get('http://192.168.1.11:8080/Ukewatashi/ws/tantousha/bykaisha/' + kaisha, {headers: headers})
    this.res = await this.http.get( Const.WWW_ROOT + 'tantousha/bykaisha/' + kaisha, {headers: headers})
    .toPromise();
    return this.res;
  }


}
