import { NgModule, isDevMode } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component'
import { ModalComponent } from './components/modal/modal.component'
import { AsideNewsComponent } from './components/aside-news/aside-news.component'
import { MainContentComponent } from './components/main-content/main-content.component'
import { HideInterfaceDirective } from './directives/hide-interface.directive'
import { SpinnerComponent } from './components/spinner/spinner.component'
import { BlurredDirective } from './directives/blurred.directive'
import { ServiceWorkerModule } from '@angular/service-worker'

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    AsideNewsComponent,
    MainContentComponent,
    HideInterfaceDirective,
    SpinnerComponent,
    BlurredDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
