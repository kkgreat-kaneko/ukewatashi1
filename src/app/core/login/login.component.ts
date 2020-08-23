import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Tantousha } from '../../class/tantousha';
import { LoginService } from '../service/login.service';
import { SessionService } from '../../service/session.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  tantousha: Tantousha = new Tantousha();
  token: any;
  loginControl: FormGroup;
  message: string;

  constructor(private loginService: LoginService, private router: Router, private sessionService: SessionService) { }

  ngOnInit() {
    sessionStorage.clear();
    this.loginControl = new FormGroup({
      userId: new FormControl('', { validators: [Validators.required] }),
      password: new FormControl('', { validators: [Validators.required] }),
    });
  }

  /*
  *  ログイン処理
  *  バックエンドとの通信結果ユーザー名パスワードがOKなら、アクセストークンを受け取る(以後通信にはトークン必要)
  *  システム上必要な担当者情報を保持
  */
  public login() {
    this.tantousha.userId = this.loginControl.value.userId;
    this.tantousha.password = this.loginControl.value.password;
    this.loginService.authenticate(this.tantousha)
    .then( res => {
      sessionStorage.setItem('token', res.token);               // バックエンドから受け取りアクセストークン
      sessionStorage.setItem('userId', res.tantousha.userId);   // 担当者ID
      sessionStorage.setItem('shimei', res.tantousha.shimei);   // 担当者氏名
      sessionStorage.setItem('kengen', res.tantousha.kengen);   // 担当者権限
      sessionStorage.setItem('kaisha', res.tantousha.kaisha);   // 担当者会社情報
      sessionStorage.setItem('busho', res.tantousha.busho);     // 担当者チーム
      sessionStorage.setItem('pwdExpired', '');                 // パスワード期限フラグ初期化
      this.token = sessionStorage.getItem('token');

      /*
      *  パスワード有効期限チェック有効期限:設定から９０日間
      *  MainComponent初期化時にフラグ判別しパスワード変更画面を開く
      *  パスワード有効期限切れ２週間前チェック：期限切れ14日前
      */
      let expireDate = new Date(res.tantousha.passwordSetdate);
      /*test*/ //let expireDate = new Date('2020/02/10 00:00:00');
      expireDate.setDate(expireDate.getDate() + 90);            // 90日後有効期限切れ
      let beforeTwoWeeks = new Date(expireDate.getTime());
      beforeTwoWeeks.setDate(beforeTwoWeeks.getDate() - 14);    // 14日前有効期限切れ
      let currentDate = new Date();                             // 現在の日付
      if (currentDate.getTime() > expireDate.getTime()) {       // パスワード有効期限チェック
        sessionStorage.setItem('pwdExpired', '1');              // パスワード期限フラグセット
      } else {
        const pwdChkbreforeAlertDate =  (beforeTwoWeeks.getTime() - currentDate.getTime()) / 86400000;    // 8600000ミリ秒= 1日
        if (pwdChkbreforeAlertDate < 0) {
          sessionStorage.setItem('pwdBeforeExpired', '1');      // パスワード14日前期限フラグセット
        }
      }
      this.router.navigate(['/main']);
    })
    .catch(err => {
      console.log('error LoginComponent login()');
    })
    .then( () => {
      if (!this.token) {
        this.message = '*ログインID、パスワードが正しくありません。';
      }
    });
  }

  public cancel() {
    this.userId.reset();
    this.password.reset();
    this.message = '';
  }

  get userId() { return this.loginControl.get('userId'); }
  get password() { return this.loginControl.get('password'); }
}
