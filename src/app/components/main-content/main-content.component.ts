import { Component, OnInit } from '@angular/core'
import { UiService } from '../../services/ui.service'

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
}
