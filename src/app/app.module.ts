import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CoreModule } from './core/core.module';
import { MainsModule } from './mains/mains.module';
import { PopupModule } from './popup/popup.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { MstTantoushaModule } from './mst-tantousha/mst-tantousha.module';
import { MstHokengaishaModule } from './mst-hokengaisha/mst-hokengaisha.module';
import { MstHokengaishaListModule } from './mst-hokengaisha-list/mst-hokengaisha-list.module';
import { MstKubunModule } from './mst-kubun/mst-kubun.module';
import { MstShoruiModule } from './mst-shorui/mst-shorui.module';
import { MainsInsModule } from './mains-ins/mains-ins.module';

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
    MaintenanceModule,
    MstTantoushaModule,
    MstHokengaishaModule,
    MstHokengaishaListModule,
    MstKubunModule,
    MstShoruiModule,
    MainsInsModule,
  ],
  providers: [{provide: LOCALE_ID, useValue: 'ja-JP'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
