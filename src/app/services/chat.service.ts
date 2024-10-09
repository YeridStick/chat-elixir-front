import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:4000/api';
  private wsUrl = 'ws://localhost:4000/websocket';
  private socket$: WebSocketSubject<any>;
  private messagesSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {
    this.socket$ = webSocket(this.wsUrl);
    this.socket$.subscribe(
      msg => this.handleNewMessage(msg),
      err => console.error(err),
      () => console.log('WebSocket connection closed')
    );
  }

  getMessages(): Observable<any[]> {
    return this.messagesSubject.asObservable();
  }

  sendMessage(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, { body: message });
  }

  private handleNewMessage(msg: any) {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, msg]);
  }

  loadInitialMessages() {
    this.http.get<any[]>(`${this.apiUrl}/messages`).subscribe(
      messages => this.messagesSubject.next(messages),
      error => console.error('Error loading messages', error)
    );
  }
}