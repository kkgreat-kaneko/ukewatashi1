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
    //this.res = await this.http.get('http://192.168.1.11:8080/Ukewatashi/ws/shorui/alllist', {headers: headers})
    this.res = await this.http.get( Const.WWW_ROOT + 'shorui/alllist', {headers: headers})
    .toPromise();
    return this.res;
  }
}
