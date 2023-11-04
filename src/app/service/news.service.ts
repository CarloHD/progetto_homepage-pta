import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Subject, combineLatest, map, tap } from 'rxjs'
import { PostOriginal } from '../model/post-original.model'
import { Post } from '../model/post.model'
import { FirebaseService } from './firebase.service'
import { UiService } from './ui.service'

const urlNews =
  'https://www.mondomobileweb.it/wp-json/wp/v2/posts?categories=4840'

interface errorType {
  status: number
  statusText: string
  ok: boolean
  message: string
  name?: string
  error: {
    code?: string
    message?: string
    data?: {
      status: number
    }
  }
}

const datesAreOnSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor (
    private http: HttpClient,
    private firebaseService: FirebaseService,
    private uiService: UiService
  ) {}

  dataUpdateSubject = new Subject<string>()
  postsSubject = new Subject<Post[]>()
  errorSubject = new Subject<string>()

  fetchPost () {
    const date = Date.now()
    const post1 = this.http.get<PostOriginal[]>(urlNews)

    const post2 = this.http.get<PostOriginal[]>(urlNews + '&page=2')

    return combineLatest({ post1, post2 }).pipe(
      map(data => {
        const allPostsOriginal = [...data.post1, ...data.post2]

        const allPosts: Post[] = allPostsOriginal.map(post => {
          return {
            id: post.id,
            title: post.title.rendered,
            date: post.date,
            content: post.excerpt.rendered
          }
        })

        const arrayOperatori = [
          'tim',
          'vodafone',
          'windtre',
          'fastweb',
          'postemobile'
        ]
        let filteredPost: Post[] = []
        /**
         *  filtro post solo per operatori mobile e rimozione doppioni
         */
        arrayOperatori.forEach(operatore => {
          allPosts.map(post => {
            if (
              post.title.toLowerCase().includes(operatore) &&
              !filteredPost.includes(post)
            ) {
              filteredPost.push(post)
            }
          })
        })

        /** ordinamento post per data */
        filteredPost.sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()

          return dateB - dateA
        })

        return { date, filteredPost }
      }),
      tap(result => {
        this.firebaseService.saveOnDatabase(result.date, result.filteredPost)
      })
    )
  }

  handleFetch (result: { date: number; filteredPost: Post[] }) {
    {
      this.uiService.spinnerSubject.next(false)
      this.dataUpdateSubject.next(new Date(result.date).toLocaleString())
      this.postsSubject.next(result.filteredPost)
    }
  }

  onLoadPosts () {
    this.uiService.spinnerSubject.next(true)
    const dateNow = new Date()
    this.firebaseService.getLastUpdate().subscribe(lastUpdate => {
      if (
        !lastUpdate ||
        (lastUpdate && !datesAreOnSameDay(new Date(lastUpdate), dateNow))
      ) {
        console.log('fetch dal sito')
        this.fetchPost().subscribe({
          next: result => this.handleFetch(result),
          error: (err: errorType) => {
            if (err.error.message) {
              this.errorSubject.next(err.error.message)
            } else {
              this.errorSubject.next(err.message)
            }
          }
        })
      } else {
        console.log('fetch dal db')
        this.firebaseService.getSavedPosts().subscribe(savedPosts => {
          this.handleFetch({
            date: parseInt(lastUpdate),
            filteredPost: savedPosts
          })
        })
      }
    })
  }
}