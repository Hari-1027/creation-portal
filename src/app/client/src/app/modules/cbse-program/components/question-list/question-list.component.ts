import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionListComponent implements OnInit, AfterViewInit {
  public active: boolean[] = [];
  public tabs: { header: string; content: string }[] = [
      { header: 'Q1', content: '' }
  ];
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  public addTab(): void {
    this.active.push(true);
    console.log(this.tabs.length);
    this.tabs.push({
        header: 'Q1',
        content: 'Another dynamic tab'
    });
    // console.log(document.querySelector( '#editor' ));
}
public removeTab(): void {
    this.active.pop();
    this.tabs.pop();
}

}