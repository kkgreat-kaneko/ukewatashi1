import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Tantousha } from '../class/tantousha';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() {}

  // AuthGuardで使用
  // app-routing 画面遷移ガード用
  // トークン有無の判別で許可
  // トークン自体の有効性はバックエンド側でしかできない。
  public auth(): boolean {
    const token = sessionStorage.getItem('token');
    return token != null;
  }

  // Jax-RSバックエンド通信のAuthorizationヘッダー 値'Bearer　トークン文字列'をセット
  // トークンはログイン時にバックエンドから受け取りSessionStorageに保存(login処理時)
  // セッションサービスDIで保持した場合、ページのリロードに対応不可の為、SessionStorageに保存
  public setTkHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Bearer ' + sessionStorage.getItem('token'));
    return headers;
  }

  /*
  * ログイン担当者情報 *現在未使用メソッド
  * セッションサービスのプロパティにセット
  */
  public setLoginUser(): Tantousha {
    const loginUser = new Tantousha();
    loginUser.userId = sessionStorage.getItem('userId');
    loginUser.shimei = sessionStorage.getItem('shimei');
    loginUser.kengen = Number(sessionStorage.getItem('kengen'));
    loginUser.kaisha = sessionStorage.getItem('kaisha');
    loginUser.busho = sessionStorage.getItem('busho');
    return loginUser;
  }

  /*
  *  パスワード有効期限チェックフラグを返す。空文字＝有効、１がセット＝失効
  *　ログイン処理時に有効期限９０日内かチェックしセット、変更画面で更新すると空文字にセット
  */
  public getPwdExpired(): string {
    return sessionStorage.getItem('pwdExpired');
  }

  /*
  *
  */
  public resetPwdExpired() {
    sessionStorage.setItem('pwdExpired', '');          // パスワード期限フラグ初期化
  }

  /*
  *  パスワード有効期限切れ１４日前フラグを返す
  *
  */
  public getPwdBeforeExpired() {
    return sessionStorage.getItem('pwdBeforeExpired');
  }

  /*
  * Current日付を返す
  */
  public getToday(): string {
    const date = new Date();
    const yyyymmdd = date.getFullYear() + '/' + this.toDoubleDigit(date.getMonth() + 1) + '/' + this.toDoubleDigit(date.getDate())
                    + ' ' + this.toDoubleDigit(date.getHours()) + ':' + this.toDoubleDigit(date.getMinutes()) + ':'
                    + this.toDoubleDigit(date.getSeconds());
    return yyyymmdd;
  }

  /*
  * 数字のゼロ詰め処理 日付時刻のゼロ詰めに使用
  */
  public toDoubleDigit(num: number): string {
    let strNum = String(num);  // string変換
    if (strNum.length === 1) {
      strNum = '0' + strNum;
    }
    return strNum;
  }

// -----------------------------------------------------------------------------
// サービスDIによるコンポーネント間のデータ連携だが、ページリロードには対応しないので
// ログイン情報はsessionStorageに保存する
/*
  public setTantousha(tantousha: Tantousha) {
    this.loginUser = tantousha;
  }

  public logOut() {
    this.loginUser = null;
  }

  public getUserId() {
    if (this.loginUser) {
      return this.loginUser.userId;
    }
  }

  public getKengen() {
    if (this.loginUser) {
      return this.loginUser.kengen;
    }
  }
*/
}
