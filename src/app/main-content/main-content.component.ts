import { Component, OnInit } from '@angular/core'
import { UiService } from '../service/ui.service'

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit {
  constructor (private uiService: UiService) {
    this.uiService.toggleVideoSubject.subscribe(
      value => (this.switchIsOn = value)
    )
  }

  ore: string = ''
  minuti: string = ''
  data: string = ''

  longPressTimer: any
  longPressState = false

  switchIsOn = false

  ngOnInit (): void {
    setInterval(() => {
      this.setTime()
    }, 1000)

    this.setTime()
  }

  onClickInfo () {
    this.uiService.toggleModalSubject.next(true)
  }

  onClickVideoSwitch () {
    this.switchIsOn = !this.switchIsOn
    this.uiService.toggleVideoSubject.next(this.switchIsOn)
  }

  setTime () {
    const giorno = new Date()

    const getOre = giorno.getHours().toString()
    let getMinuti = giorno.getMinutes().toString()

    if (parseInt(getMinuti) <= 9) {
      getMinuti = '0' + getMinuti
    }

    this.ore = getOre
    this.minuti = getMinuti

    this.data = giorno.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    })
  }

  toggleFullscreen (event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains('central_content') ||
      (event.target as HTMLElement).tagName === 'UL' ||
      (event.target as HTMLElement).tagName === 'FOOTER' ||
      (event.target as HTMLElement).tagName === 'HEADER'
    ) {
      const element = document.documentElement

      if (document.fullscreenElement === null) {
        element.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }

  hideInterfaceOnLongPress (event: MouseEvent | TouchEvent) {
    if ((event.target as HTMLElement).localName !== 'a') {
      this.longPressTimer = setTimeout(() => {
        this.uiService.longPressSubject.next(true)
      }, 800)
    }
  }

  showInterfaceOnUnpress () {
    clearTimeout(this.longPressTimer)
    this.uiService.longPressSubject.next(false)
  }
}
