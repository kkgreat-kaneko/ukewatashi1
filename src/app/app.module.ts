import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CoreModule } from './core/core.module';
import { MainsModule } from './mains/mains.module';
import { PopupModule } from './popup/popup.module';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    MainsModule,
    PopupModule,
  ],
  providers: [{provide: LOCALE_ID, useValue: 'ja-JP'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
