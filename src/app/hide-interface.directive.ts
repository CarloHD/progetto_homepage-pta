import { Directive, ElementRef } from '@angular/core'
import { UiService } from './service/ui.service'

@Directive({
  selector: '[appHideInterface]'
})
export class HideInterfaceDirective {
  constructor (
    private element: ElementRef<HTMLElement>,
    private uiService: UiService
  ) {
    this.element.nativeElement.style.transition = 'opacity ease-in-out 200ms'

    this.uiService.longPressSubject.subscribe(value => {
      if (value) {
        this.element.nativeElement.style.opacity = '0'
      } else {
        this.element.nativeElement.style.removeProperty('opacity')
      }
    })
  }
}
