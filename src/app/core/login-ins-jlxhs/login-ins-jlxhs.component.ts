import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Hokengaisha } from '../../class/hokengaisha';
import { LoginService } from '../service/login.service';
import { SessionService } from '../../service/session.service';

@Component({
  selector: 'app-login-ins-jlxhs',
  templateUrl: './login-ins-jlxhs.component.html',
  styleUrls: ['./login-ins-jlxhs.component.css']
})
export class LoginInsJlxhsComponent implements OnInit {
  hokengaisha: Hokengaisha = new Hokengaisha();
  token: any;
  loginControl: FormGroup;
  message: string;

  constructor(private loginService: LoginService, 
    private router: Router, private sessionService: SessionService
  ) { }

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
      sessionStorage.setItem('insJlxHs', 'true');                         // JLXHS会社モードON *未使用 insJlxがセット未セットで判別している
      this.token = sessionStorage.getItem('token');
      
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
