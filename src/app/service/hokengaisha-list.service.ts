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
    //this.res = await this.http.get('http://192.168.1.11:8080/Ukewatashi/ws/hokengaishalist/alllist', {headers: headers})
    this.res = await this.http.get( Const.WWW_ROOT + 'hokengaishalist/alllist', {headers: headers})
    .toPromise();
    return this.res;
  }
}
