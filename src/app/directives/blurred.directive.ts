import { Directive, ElementRef } from '@angular/core'
import { UiService } from '../services/ui.service'

@Directive({
  selector: '[appBlurred]'
})
export class BlurredDirective {
  constructor (
    private element: ElementRef<HTMLElement>,
    private uiService: UiService
  ) {
    this.element.nativeElement.style.backgroundColor = 'black'
    this.element.nativeElement.style.opacity = '.5'

    this.element.nativeElement.style.transition = 'opacity ease-in-out 300ms'

    this.uiService.longPressSubject.subscribe(value => {
      if (value) {
        this.element.nativeElement.style.opacity = '0'
      } else {
        this.element.nativeElement.style.backgroundColor = 'black'
        this.element.nativeElement.style.opacity = '.5'
      }
    })
  }
}
