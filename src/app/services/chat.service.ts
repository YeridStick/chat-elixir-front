import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:4000/api';
  private wsUrl = 'ws://localhost:4000/websocket';
  private socket$: WebSocketSubject<any>;
  private messagesSubject = new BehaviorSubject<any[]>([]);
  private lastSentMessage: string | null = null;

  constructor(private http: HttpClient) {
    this.socket$ = this.getNewWebSocket();
    this.socket$.subscribe({
      next: (message) => this.handleNewMessage(message),
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed')
    });
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: this.wsUrl,
      openObserver: {
        next: () => console.log('WebSocket connection opened')
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
          this.socket$ = this.getNewWebSocket();
        }
      }
    });
  }

  getMessages(): Observable<any[]> {
    return this.messagesSubject.asObservable();
  }

  sendMessage(message: string): Observable<any> {
    this.lastSentMessage = message;
    return this.http.post(`${this.apiUrl}/messages`, { body: message })
      .pipe(
        tap(() => {
          const newMessage = { body: message, fecha: new Date().toISOString(), sent: true };
          this.handleNewMessage(newMessage);
        }),
        catchError(this.handleError)
      );
  }

  private handleNewMessage(msg: any) {
    const currentMessages = this.messagesSubject.value;
    if (msg.body !== this.lastSentMessage || msg.sent === false) {
      this.messagesSubject.next([...currentMessages, msg]);
    }
    this.lastSentMessage = null;
  }

  loadInitialMessages() {
    this.http.get<any[]>(`${this.apiUrl}/messages`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (messages) => this.messagesSubject.next(messages),
        error: (error) => console.error('Error loading messages', error)
      });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  deleteAllMessages(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages`)
      .pipe(
        tap(() => {
          this.messagesSubject.next([]);
        }),
        catchError(this.handleError)
      );
  }
}