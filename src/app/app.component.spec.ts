import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Storage } from '@ionic/storage-angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let storageMock: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    storageMock = jasmine.createSpyObj('Storage', ['create', 'get', 'set', 'remove']);
    storageMock.create.and.returnValue(Promise.resolve(storageMock));

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: Storage, useValue: storageMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
