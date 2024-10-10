import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
  ],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: any[] = [];
  private messageSubscription: Subscription = new Subscription();

  @ViewChild('scrollContainer') private readonly scrollContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  @ViewChild('userInput') private userInput!: ElementRef;

  constructor(private readonly chatService: ChatService) {}

  ngOnInit() {
    this.messageSubscription = this.chatService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error) => console.error('Error getting messages', error)
    });
    this.chatService.loadInitialMessages();
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    const userName = this.userInput.nativeElement.value.trim() || 'Anónimo';
    const messageText = this.messageInput.nativeElement.value.trim();
    
    if (messageText) {
      const fullMessage = `${userName}: ${messageText}`;
      this.chatService.sendMessage(fullMessage).subscribe({
        next: () => {
          this.messageInput.nativeElement.value = '';
        },
        error: (error) => console.error('Error sending message', error)
      });
    }
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  deleteAllMessages() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los mensajes?')) {
      this.chatService.deleteAllMessages().subscribe({
        next: () => {
          console.log('Todos los mensajes han sido eliminados');
        },
        error: (error) => console.error('Error al eliminar los mensajes', error)
      });
    }
  }
}