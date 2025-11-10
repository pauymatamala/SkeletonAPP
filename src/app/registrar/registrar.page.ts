import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar',
  standalone: false,
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
})

export class RegistrarPage {
  constructor(private router: Router) {}
  @ViewChild('popover') popover!: HTMLIonPopoverElement;

  isOpen = false;
  nacimiento: string | null = null;
  // Campos temporales enlazados desde la plantilla
  nombre: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  confirm: string = '';
  nacimientoDate: Date = new Date();

  presentPopover(e: Event) {
    // asigna el evento al popover y abre
    this.popover.event = e;
    this.isOpen = true;
  }

  saveTemp() {
    const temp = {
      nombre: this.nombre,
      username: this.username,
      email: this.email,
      password: this.password,
      confirm: this.confirm,
      nacimiento: this.nacimiento,
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