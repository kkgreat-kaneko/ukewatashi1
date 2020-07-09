import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';

import { LoginComponent } from './login/login.component';
import { LoginInsJlxComponent } from './login-ins-jlx/login-ins-jlx.component';
import { LoginInsJlxhsComponent } from './login-ins-jlxhs/login-ins-jlxhs.component';


@NgModule({
  declarations: [LoginComponent, LoginInsJlxComponent, LoginInsJlxhsComponent],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatInputModule,
  ],
  exports: [
    LoginComponent, LoginInsJlxComponent, LoginInsJlxhsComponent
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
