import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Storage } from '@ionic/storage-angular';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let storageMock: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    storageMock = jasmine.createSpyObj('Storage', ['create', 'get', 'set', 'remove']);
    storageMock.create.and.returnValue(Promise.resolve(storageMock));
    
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: Storage, useValue: storageMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
