import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Hokengaisha } from '../../class/hokengaisha';
import { LoginService } from '../service/login.service';
import { SessionService } from '../../service/session.service';

@Component({
  selector: 'app-login-ins-jlx',
  templateUrl: './login-ins-jlx.component.html',
  styleUrls: ['./login-ins-jlx.component.css']
})
export class LoginInsJlxComponent implements OnInit {
  hokengaisha: Hokengaisha = new Hokengaisha();
  token: any;
  loginControl: FormGroup;
  message: string;

  constructor(private loginService: LoginService, private router: Router, private sessionService: SessionService) { }

  ngOnInit() {
    sessionStorage.clear();
    this.loginControl = new FormGroup({
      userId: new FormControl('', { validators: [Validators.required] }),
      //password: new FormControl('', { validators: [Validators.required] }),
      password: new FormControl(''),
    });
  }

  /*
  *  ログイン処理
  *  バックエンドとの通信結果ユーザー名パスワードがOKなら、アクセストークンを受け取る(以後通信にはトークン必要)
  *  システム上必要な担当者情報を保持
  */
  public login() {
    this.hokengaisha.userId = this.loginControl.value.userId;
    this.hokengaisha.password = this.loginControl.value.password;
    this.loginService.authenticateIns(this.hokengaisha)
    .then( res => {
      sessionStorage.setItem('token', res.token);                         // バックエンドから受け取りアクセストークン
      sessionStorage.setItem('userIdHoken', res.hokengaisha.userId);      // 担当者ID
      sessionStorage.setItem('kakuninsha', res.hokengaisha.kakuninsha);   // 担当者氏名
      sessionStorage.setItem('hokengaisha', res.hokengaisha.hokengaisha); // 担当者保険会社名
      sessionStorage.setItem('insJlx', 'true');                           // JLX保険会社モードON
      //sessionStorage.setItem('seiho', res.hokengaisha.seiho);           // 担当者生保
      //sessionStorage.setItem('pwdExpired', '');                         // パスワード期限フラグ初期化
      this.token = sessionStorage.getItem('token');
      /*debug log*/ //console.log(this.token); console.log(sessionStorage.getItem('userId')); console.log(sessionStorage.getItem('kakuninsha')); console.log(sessionStorage.getItem('hokengaisha'));
      /*
      *  パスワード有効期限チェック有効期限:設定から９０日間
      *  MainComponent初期化時にフラグ判別しパスワード変更画面を開く
      *  パスワード有効期限切れ２週間前チェック：期限切れ14日前
      */
      /*
      let expireDate = new Date(res.tantousha.passwordSetdate);
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
      */
      this.router.navigate(['/main-ins']);
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
