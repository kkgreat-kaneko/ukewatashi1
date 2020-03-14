import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tantousha } from '../../class/tantousha';
import { Const } from '../../class/const';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  res: any;
  constructor(private http: HttpClient) { }

  public async authenticate(tantousha: Tantousha): Promise<any> {
    //this.res = await this.http.post('http://192.168.1.11:8080/Ukewatashi/ws/tantousha/auth', tantousha)
    this.res = await this.http.post(Const.WWW_ROOT + 'tantousha/auth', tantousha)
    .toPromise()
    .catch(err => console.log('error LoginService'));
    return this.res;
  }
}
