import { Injectable } from '@angular/core'
import { Post } from '../models/post.model'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

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

  saveOnDatabase (date: number, posts: Post[]) {
    this.http
      .post<{ idToken: string }>(authEndpoint, {
        returnSecureToken: true
      })
      .subscribe(res => {
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
