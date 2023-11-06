import { Injectable } from '@angular/core'
import { BehaviorSubject, Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UiService {
  constructor () {}

  asideExpanseSubject = new Subject<boolean>()

  toggleVideoSubject = new Subject<boolean>()

  longPressSubject = new Subject<boolean>()

  toggleModalSubject = new Subject<boolean>()

  spinnerSubject = new BehaviorSubject<boolean>(false)
}
