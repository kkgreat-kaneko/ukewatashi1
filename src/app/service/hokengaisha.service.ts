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
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/hokengaisha/tantoulist', hokengaisha, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/tantoulist', hokengaisha, {headers: headers})
    .toPromise();
    return this.res;
  }

  public async getSeihoList(seihoList: SeihoList): Promise<SeihoList[]> {
    const headers = this.session.setTkHeaders();
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/hokengaisha/seiholist', seihoList, {headers: headers})
    this.res = await this.http.post( Const.WWW_ROOT + 'hokengaisha/seiholist', seihoList, {headers: headers})
    .toPromise();
    return this.res;
  }
}
