import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
export class ChatComponent implements OnInit {
  messages: any[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getMessages().subscribe(messages => {
      this.messages = messages;
    });
    this.chatService.loadInitialMessages();
  }

  sendMessage(message: string) {
    if (message.trim()) {
      this.chatService.sendMessage(message).subscribe(
        response => console.log('Message sent', response),
        error => console.error('Error sending message', error)
      );
    }
  }
}