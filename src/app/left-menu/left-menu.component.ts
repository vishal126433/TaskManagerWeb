import { MatIconModule } from '@angular/material/icon'; 
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-left-menu',
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
  
})


export class LeftMenuComponent {
  isCollapsed = false;
  

 

  @Output() collapsedChange = new EventEmitter<boolean>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
