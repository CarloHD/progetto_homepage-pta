import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Subject, combineLatest, map, tap, throwError } from 'rxjs'
import { PostOriginal } from '../models/post-original.model'
import { Post } from '../models/post.model'
import { FirebaseService } from './firebase.service'
import { UiService } from './ui.service'
import { environment } from 'src/environments/environment'

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
  errorSubject = new Subject<{
    infoError: string
    errorMsg: string
  } | null>()

  fetchPost () {
    const date = Date.now()
    const post1 = this.http.get<PostOriginal[]>(environment.urlNews)

    const post2 = this.http.get<PostOriginal[]>(environment.urlNews + '&page=2')

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

        return { date, posts: filteredPost }
      }),
      tap(result => {
        this.firebaseService.saveOnDatabase(result.date, result.posts)
      })
    )
  }

  handleFetch (result: { date: number; posts: Post[] }) {
    {
      this.uiService.spinnerSubject.next(false)
      this.dataUpdateSubject.next(new Date(result.date).toLocaleString())
      this.postsSubject.next(result.posts)
    }
  }

  handleError (
    err: errorType,
    extraInfo: { erroreDatabase: boolean; erroreFonte: boolean }
  ) {
    const errorObj: { infoError: string; errorMsg: string } = {
      infoError: '',
      errorMsg: ''
    }

    switch (true) {
      case extraInfo.erroreDatabase && !extraInfo.erroreFonte:
        errorObj.infoError =
          'Non è stato possibile connettersi al database.\n\n Controlla la tua connessione o riprova piu tardi.'

        break

      case extraInfo.erroreFonte && !extraInfo.erroreDatabase:
        errorObj.infoError =
          'Non è stato possibile aggiornare le news, verranno mostrate delle news meno recenti se disponibili.\n\n Controlla la tua connessione o riprova piu tardi.'
        break

      case extraInfo.erroreFonte && extraInfo.erroreDatabase:
        errorObj.infoError =
          'Si sono verificati errori di connessione al database ed alla fonte delle news.\n\n Controlla la tua connessione o riprova piu tardi.'
        break

      default:
        errorObj.infoError = 'Si è verificato un errore imprevisto!'
        break
    }

    errorObj.errorMsg = err.error.message || err.message

    this.uiService.spinnerSubject.next(false)
    this.errorSubject.next(errorObj)
  }

  onLoadPosts () {
    this.errorSubject.next(null)
    this.uiService.spinnerSubject.next(true)
    const dateNow = new Date()
    /**
     * Timeout per mostrare caricamento
     * (psicologicamente fa pensare che stia caricando)
     */
    setTimeout(() => {
      // prendo la data dell'ultima fetch
      this.firebaseService.getLastUpdate().subscribe({
        next: lastUpdate => {
          // se data MANCANTE effettuo fetch da fonte posts
          if (!lastUpdate) {
            console.log('fetch dal sito per prima volta')
            this.fetchPost().subscribe({
              next: result => this.handleFetch(result),
              error: (err: errorType) => {
                this.handleError(err, {
                  erroreDatabase: false,
                  erroreFonte: true
                })
              }
            })
            // se data SCADUTA effettuo fetch da fonte posts
          } else if (!datesAreOnSameDay(new Date(lastUpdate), dateNow)) {
            console.log('fetch dal sito')
            this.fetchPost().subscribe({
              next: result => this.handleFetch(result),
              error: (err: errorType) => {
                // se data SCADUTA ed errore connessione per fonte posts
                // effettuo fetch database
                console.log('fetch dal db')
                this.firebaseService.getSavedPosts().subscribe({
                  next: savedPosts => {
                    this.handleError(err, {
                      erroreDatabase: false,
                      erroreFonte: true
                    })

                    this.handleFetch({
                      date: parseInt(lastUpdate),
                      posts: savedPosts
                    })
                  },
                  error: err => {
                    this.handleError(err, {
                      erroreDatabase: true,
                      erroreFonte: true
                    })
                  }
                })
              }
            })
          } else {
            //se data NON SCADUTA effettuo fetch da database
            console.log('fetch dal db')
            this.firebaseService.getSavedPosts().subscribe({
              next: savedPosts => {
                this.handleFetch({
                  date: parseInt(lastUpdate),
                  posts: savedPosts
                })
              },
              error: err => {
                this.handleError(err, {
                  erroreDatabase: true,
                  erroreFonte: false
                })
              }
            })
          }
        },
        error: err => {
          this.handleError(err, { erroreDatabase: true, erroreFonte: false })
        }
      })
    }, 500)
  }
}
