import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { HokengaishaList } from '../class/hokengaisha-list';
import { Const } from '../class/const';

@Injectable({
  providedIn: 'root'
})
export class HokengaishaListService {
  res: any;
  constructor(private http: HttpClient, private session: SessionService) { }

  public async getAllList(): Promise<HokengaishaList[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'hokengaishalist/alllist', {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社名より1件検索
  *
  */
  public async getByHokengaishaName(name: string): Promise<HokengaishaList[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'hokengaishalist/getbyhokengaishaname/' + name, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社登録
  *
  */
  public async create(hokengaishaList: HokengaishaList): Promise<HokengaishaList> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaishalist/create/', hokengaishaList, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社更新 1件
  *
  */
  public async update(hokengaishaList: HokengaishaList): Promise<HokengaishaList> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaishalist/update/', hokengaishaList, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社IDより1件削除
  *
  */
  public async delete(id: number): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.delete( Const.WWW_ROOT + 'hokengaishalist/delete/' + id, {headers: headers})
    .toPromise();
    return this.res;
  }

}
