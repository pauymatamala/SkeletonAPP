import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-registrar',
  standalone: false,
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
})

export class RegistrarPage implements OnInit {
  registerForm: FormGroup;
  @ViewChild('popover') popover!: HTMLIonPopoverElement;

  isOpen = false;
  nacimiento: string | null = null;
  nacimientoDate: Date = new Date();

  constructor(private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
      nacimiento: [null]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {}

  presentPopover(e: Event) {
    // asigna el evento al popover y abre
    this.popover.event = e;
    this.isOpen = true;
  }

  saveTemp() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const temp = {
      ...this.registerForm.value,
      savedAt: new Date().toISOString()
    };
    // Guardar temporalmente en sessionStorage
    try {
      sessionStorage.setItem('tempRegistration', JSON.stringify(temp));
      console.log('Datos temporales guardados en sessionStorage:', temp);
      // después de guardar, redirigir al login
      this.router.navigate(['/login']);
    } catch (e) {
      console.error('Error guardando en sessionStorage', e);
    }
  }

  onDateSelect(ev: any) {
    // ev.detail.value viene con la fecha seleccionada en formato ISO (p.ej. 2025-11-07)
    const value = ev?.detail?.value ?? null;
    this.nacimiento = value;
    // cerrar el popover (intentar dismiss() por si acaso) y actualizar flag
    try {
      this.popover?.dismiss?.();
    } catch (e) {
      // si dismiss falla, usar el binding
    }
    this.isOpen = false;
    console.log('Fecha seleccionada:', this.nacimiento);
    // también asignar al formulario
    try {
      this.registerForm.patchValue({ nacimiento: this.nacimiento });
    } catch (e) {}
  }

  // Validador de grupo: confirmar contraseña
  private passwordsMatch(control: AbstractControl) {
    const p = control.get('password')?.value;
    const c = control.get('confirm')?.value;
    if (p && c && p !== c) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  // Navegación mínima para el botón "Registrar"
  goToLogin() {
    // redirige a la ruta /login (ajusta si quieres otra ruta)
    this.router.navigate(['/login']);
  }

  // alias por compatibilidad con nombres previos
  goToLo() {
    this.goToLogin();
  }
}