import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { Shorui } from '../class/shorui';
import { Const } from '../class/const';

@Injectable({
  providedIn: 'root'
})
export class ShoruiService {
  res: any;

  constructor(private http: HttpClient, private session: SessionService) { }

  public async getAllList(): Promise<Shorui[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'shorui/alllist', {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  書類より1件検索
  *
  */
  public async getByShorui(name: string): Promise<Shorui[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'shorui/getbyshorui/' + name, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  書類登録
  *
  */
  public async create(shorui: Shorui): Promise<Shorui> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'shorui/create/', shorui, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  書類更新 1件
  *
  */
  public async update(shorui: Shorui): Promise<Shorui> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'shorui/update/', shorui, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  書類IDより1件削除
  *
  */
  public async delete(id: number): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.delete( Const.WWW_ROOT + 'shorui/delete/' + id, {headers: headers})
    .toPromise();
    return this.res;
  }
}
