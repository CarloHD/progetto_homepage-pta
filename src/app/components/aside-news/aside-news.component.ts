import { Component } from '@angular/core'
import { UiService } from '../../services/ui.service'
import { NewsService } from '../../services/news.service'
import { Post } from '../../models/post.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-aside-news',
  templateUrl: './aside-news.component.html',
  styleUrls: ['./aside-news.component.css']
})
export class AsideNewsComponent {
  newsSubscriptions: Subscription[] = []

  constructor (private newsService: NewsService, private uiService: UiService) {
    this.newsSubscriptions[0] = this.newsService.dataUpdateSubject.subscribe(
      dateUpdate => (this.dateUpdate = dateUpdate)
    )

    this.newsSubscriptions[1] = this.newsService.postsSubject.subscribe(
      posts => (this.posts = posts)
    )

    this.newsSubscriptions[2] = this.newsService.errorSubject.subscribe(
      errMsg => (this.error = errMsg)
    )

    this.uiService.spinnerSubject.subscribe(value => {
      this.isLoading = value
    })
  }

  expanded: boolean = false
  isLoading: boolean = false

  posts: Post[] = []
  dateUpdate: string = ''
  error = ''

  longPressTimer: any
  longPressState = false

  onClickAside () {
    this.expanded = !this.expanded
    this.uiService.asideExpanseSubject.next(this.expanded)

    if (this.expanded && this.posts.length == 0) {
      this.newsService.onLoadPosts()
    }
  }

  toggleFullscreen (event: MouseEvent) {
    const element = document.documentElement

    if (document.fullscreenElement === null) {
      element.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  hideInterfaceOnLongPress (event: TouchEvent | MouseEvent) {
    if ((event as TouchEvent).touches.length === 1) {
      if (!this.expanded) {
        this.longPressTimer = setTimeout(() => {
          this.uiService.longPressSubject.next(true)
        }, 800)
      }
    }
  }

  showInterfaceOnUnpress () {
    clearTimeout(this.longPressTimer)
    this.uiService.longPressSubject.next(false)
  }
}
