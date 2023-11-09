import { Injectable } from '@angular/core'
import { Post } from '../models/post.model'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { of, tap } from 'rxjs'

const authEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.apiKey}`
const databaseDateEndpoint =
  'https://pta-homepage-default-rtdb.europe-west1.firebasedatabase.app/date.json'
const databasePostsEndpoint =
  'https://pta-homepage-default-rtdb.europe-west1.firebasedatabase.app/posts.json'

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor (private http: HttpClient) {}

  authToken: string | null = null
  autTokenExpirationTimer: any

  getAuth () {
    this.authToken = localStorage.getItem('authToken')
    const authExpiration = localStorage.getItem('authExpiration')

    if (authExpiration && +authExpiration < Date.now()) {
      this.authToken = null
    }

    if (this.authToken !== null && authExpiration !== null) {
      this.autTokenExpirationTimer = setTimeout(() => {
        this.authToken = null
      }, +authExpiration - Date.now())
      return of({ idToken: this.authToken })
    }

    return this.http
      .post<{ idToken: string; expireIn: string }>(authEndpoint, {
        returnSecureToken: true
      })
      .pipe(
        tap(res => {
          localStorage.setItem('authToken', res.idToken)
          localStorage.setItem(
            'authExpiration',
            (Date.now() + +res.expireIn * 1000).toString()
          )
          this.autTokenExpirationTimer = setTimeout(() => {
            this.authToken = null
          }, +res.expireIn * 1000)
        })
      )
  }

  saveOnDatabase (date: number, posts: Post[]) {
    this.getAuth().subscribe(res => {
      this.http
        .put(
          `${databaseDateEndpoint}?auth=${res.idToken}`,
          JSON.stringify(date)
        )
        .subscribe()

      this.http
        .put(
          `${databasePostsEndpoint}?auth=${res.idToken}`,
          JSON.stringify(posts)
        )
        .subscribe()
    })
  }

  getLastUpdate () {
    return this.http.get<string | null>(
      'https://pta-homepage-default-rtdb.europe-west1.firebasedatabase.app/date.json'
    )
  }

  getSavedPosts () {
    return this.http.get<Post[]>(
      'https://pta-homepage-default-rtdb.europe-west1.firebasedatabase.app/posts.json'
    )
  }
}
