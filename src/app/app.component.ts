import { Component, ElementRef, ViewChild, OnInit } from '@angular/core'
import { UiService } from './service/ui.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pta_homepage'

  @ViewChild('background_video') backgroundVideo!: ElementRef<HTMLVideoElement>

  constructor (private uiService: UiService) {
    this.uiService.asideExpanseSubject.subscribe(
      value => (this.asideExpanded = value)
    )

    this.uiService.toggleModalSubject.subscribe(
      value => (this.modalVisible = value)
    )

    this.uiService.toggleVideoSubject.subscribe(value => {
      this.autoplayVideoState = value

      if (value) {
        this.enableAutoplay()
      } else {
        this.disableAutoplay()
      }
    })
  }

  ngOnInit () {
    this.loadAutoplay()
  }

  modalVisible = false

  asideExpanded = false

  autoplayVideoState: boolean = false

  enableAutoplay () {
    localStorage.setItem('autoplay', '1')

    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.style.display = 'block'

      this.backgroundVideo.nativeElement.play()
    }
  }

  disableAutoplay () {
    localStorage.setItem('autoplay', '0')

    if (this.backgroundVideo) {
      const srcVideo = this.backgroundVideo.nativeElement.src

      this.backgroundVideo.nativeElement.src = srcVideo
      this.backgroundVideo.nativeElement.style.display = 'none'
    }
  }

  loadAutoplay () {
    const loadedAutoplay = localStorage.getItem('autoplay')

    if (loadedAutoplay === '0' || loadedAutoplay === null) {
      this.uiService.toggleVideoSubject.next(false)
    } else {
      this.uiService.toggleVideoSubject.next(true)
    }
  }
}
