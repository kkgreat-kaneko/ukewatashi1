import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { Kubun } from '../class/kubun';
import { Const } from '../class/const';

@Injectable({
  providedIn: 'root'
})
export class KubunService {
  res: any;

  constructor(private http: HttpClient, private session: SessionService) { }

  public async getAllList(): Promise<Kubun[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'kubun/alllist', {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  区分より1件検索
  *
  */
  public async getByKubun(name: string): Promise<Kubun[]> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.get( Const.WWW_ROOT + 'kubun/getbykubun/' + name, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  区分登録
  *
  */
  public async create(kubun: Kubun): Promise<Kubun> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kubun/create/', kubun, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  区分更新 1件
  *
  */
  public async update(kubun: Kubun): Promise<Kubun> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.post( Const.WWW_ROOT + 'kubun/update/', kubun, {headers: headers})
    .toPromise();
    return this.res;
  }

  /*
  *  区分IDより1件削除
  *
  */
  public async delete(id: number): Promise<number> {
    const headers = this.session.setTkHeaders();
    this.res = await this.http.delete( Const.WWW_ROOT + 'kubun/delete/' + id, {headers: headers})
    .toPromise();
    return this.res;
  }
}
