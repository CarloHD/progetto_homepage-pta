import { Component } from '@angular/core'
import { UiService } from '../service/ui.service'

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  constructor (private uiService: UiService) {}

  onClickClose () {
    this.uiService.toggleModalSubject.next(false)
  }
}
