import { Component } from '@angular/core'
import { UiService } from '../service/ui.service'
import { NewsService } from '../service/news.service'
import { Post } from '../model/post.model'
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

  onClickAside () {
    this.expanded = !this.expanded
    this.uiService.asideExpanseSubject.next(this.expanded)

    if (this.expanded && this.posts.length == 0) {
      this.newsService.onLoadPosts()
    }
  }
}
