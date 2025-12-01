import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, AlertController, ToastController, AnimationController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../core/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  passwordVisible = false;

  
  
  @ViewChild('usernameInput', { read: ElementRef, static: false }) usernameInput!: ElementRef; // input for email (kept ref name for template)
  @ViewChild('passwordInput', { read: ElementRef, static: false }) passwordInput!: ElementRef;

  // inyectamos creación de animaciones y formbuilder
  constructor(private fb: FormBuilder, private router: Router, private animationCtrl: AnimationController, private storageService: StorageService) {
    this.loginForm = this.fb.group({
      // Use email as user identifier
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const email = this.loginForm.value.email;
    // Guardar usuario para persistencia usando StorageService
    try {
      const cur = (await this.storageService.get<any>('currentUser')) || {};
      cur.email = email;
      await this.storageService.set('currentUser', cur);
    } catch (e) {
      await this.storageService.set('currentUser', { email });
    }
    // Navegar a Portada pasando el email en state
    this.router.navigate(['/portada'], { state: { email }, queryParams: { email } });
  }

  // Ir a la página de registro al presionar el botón "Crear usuario"
  goToRegistrar() {
    this.router.navigate(['/registrar']);
  }

  // Crear usuario localmente (almacenamiento local)
  async createUser() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const user = this.loginForm.value.email;
    const pass = this.loginForm.value.password;
    const users = (await this.storageService.get<Record<string, string>>('users')) || {};
    if (users[user]) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Usuario existente';
      alert.message = 'El usuario ya existe.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      return;
    }
    users[user] = pass;
    await this.storageService.set('users', users);
    const toast = document.createElement('ion-toast');
    toast.message = 'Usuario creado correctamente';
    toast.duration = 2000;
    document.body.appendChild(toast);
    await toast.present();
  }

  // Recuperar contraseña: pedir usuario y mostrar **** o permitir resetear
  async recoverPassword() {
    const alertEl = document.createElement('ion-alert');
    alertEl.header = 'Recuperar contraseña';
    alertEl.inputs = [
      {
        name: 'email',
        type: 'email',
        placeholder: 'Ingresa tu correo'
      }
    ];
    alertEl.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Buscar',
          handler: async (data: any) => {
          const users = (await this.storageService.get<Record<string, string>>('users')) || {};
          const found = users[data.email];
          if (!found) {
            const a = document.createElement('ion-alert');
            a.header = 'No encontrado';
            a.message = 'Usuario no encontrado.';
            a.buttons = ['OK'];
            document.body.appendChild(a);
            await a.present();
            return;
          }
          // Mostrar contraseña enmascarada
          const masked = '****';
          const showAlert = document.createElement('ion-alert');
          showAlert.header = 'Contraseña encontrada';
          showAlert.message = `Contraseña: <strong>${masked}</strong>`;
          showAlert.buttons = [
            'OK',
            {
              text: 'Resetear',
              handler: async () => {
                const reset = document.createElement('ion-alert');
                reset.header = 'Nueva contraseña';
                reset.inputs = [
                  { name: 'newpass', type: 'password', placeholder: 'Nueva contraseña (mínimo 6 caracteres)' }
                ];
                reset.buttons = [
                  'Cancelar',
                  {
                    text: 'Guardar',
                    handler: async (rdata: any) => {
                      const np = rdata.newpass;
                      if (!/.{6,}/.test(np)) {
                        const e = document.createElement('ion-alert');
                        e.header = 'Error';
                        e.message = 'La nueva contraseña debe tener al menos 6 caracteres.';
                        e.buttons = ['OK'];
                        document.body.appendChild(e);
                        await e.present();
                        return;
                      }
                      users[data.email] = np;
                      localStorage.setItem('users', JSON.stringify(users));
                      const t = document.createElement('ion-toast');
                      t.message = 'Contraseña actualizada';
                      t.duration = 2000;
                      document.body.appendChild(t);
                      await t.present();
                    }
                  }
                ];
                document.body.appendChild(reset);
                await reset.present();
              }
            }
          ];
          document.body.appendChild(showAlert);
          await showAlert.present();
        }
      }
    ];
    document.body.appendChild(alertEl);
    await alertEl.present();
  }

  // Animaciones de foco para inputs (Ionic AnimationController + CSS fallback)
  onInputFocus(field: 'email' | 'password') {
    const el = field === 'email' ? this.usernameInput : this.passwordInput;
    if (!el || !el.nativeElement) return;
    try {
      // Añadir clase al contenedor .input-animated (no al ion-input) para evitar clipping
      const parent = el.nativeElement.closest('.input-animated');
      if (parent) parent.classList.add('focused');
    } catch (e) {
      // ignore
    }
  }

  onInputBlur(field: 'email' | 'password') {
    const el = field === 'email' ? this.usernameInput : this.passwordInput;
    if (!el || !el.nativeElement) return;
    try {
      const parent = el.nativeElement.closest('.input-animated');
      if (parent) parent.classList.remove('focused');
    } catch (e) {
      // ignore
    }
  }

}
