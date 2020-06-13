import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { Hokengaisha } from '../class/hokengaisha';
import { SeihoList } from '../class/seiho-list';
import { Const } from '../class/const';

@Injectable({
  providedIn: 'root'
})
export class HokengaishaService {
  res: any;
  constructor(private http: HttpClient, private session: SessionService) { }

  public async getHokenTantouList(hokengaisha: Hokengaisha): Promise<Hokengaisha[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/tantoulist', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

  public async getSeihoList(seihoList: SeihoList): Promise<SeihoList[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/seiholist', seihoList, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社担当者IDより1件検索
  *
  */
  public async getByID(id: string): Promise<Hokengaisha> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'hokengaisha/getbyid/' + id, {headers: headers})
    .toPromise();
    return this.res;
  }

  public async getHokenTantouAll() {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'hokengaisha/hokentantouall', {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社担当者登録
  *
  */
  public async create(hokengaisha: Hokengaisha): Promise<Hokengaisha> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/create/', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社担当者更新 1件
  *
  */
  public async update(hokengaisha: Hokengaisha): Promise<Hokengaisha> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/update/', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  保険会社担当者IDより1件削除
  *
  */
  public async delete(id: string): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.delete( Const.WWW_ROOT + 'hokengaisha/delete/' + id, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 保険会社担当者ID部分一致検索
  */
  public async findLikeUserId(hokengaisha: Hokengaisha): Promise<Hokengaisha[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/findlikeuserid', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 確認者氏名部分一致検索
  */
  public async findLikeKakuninsha(hokengaisha: Hokengaisha): Promise<Hokengaisha[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/findlikekakuninsha', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  * 担当者ID AND 確認者氏名部分一致検索
  */
  public async findLikeUserIdAndKakuninsha(hokengaisha: Hokengaisha): Promise<Hokengaisha[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/findlikeuseridkakuninsha', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

}
