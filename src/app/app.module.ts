import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component'
import { ModalComponent } from './modal/modal.component'
import { AsideNewsComponent } from './aside-news/aside-news.component'
import { MainContentComponent } from './main-content/main-content.component'
import { HideInterfaceDirective } from './hide-interface.directive';
import { SpinnerComponent } from './spinner/spinner.component'

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    AsideNewsComponent,
    MainContentComponent,
    HideInterfaceDirective,
    SpinnerComponent
  ],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
