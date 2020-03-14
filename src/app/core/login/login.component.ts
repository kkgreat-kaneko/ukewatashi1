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
      this.token = sessionStorage.getItem('token');

      // ---test--- セッションDIのテスト ページリロードは不可
      // this.sessionService.setTantousha(res.tantousha); //
      // ---test end --

      // 権限タイプによってルーティングだったが変更 権限によってメニュー表示非表示にする
      // if (res.kengen === 0) {
      this.router.navigate(['/main']);
      // }
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
