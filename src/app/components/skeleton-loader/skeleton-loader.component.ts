import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de Skeleton Loader
 * 
 * Mejora la UX mostrando placeholders animados mientras se cargan los datos
 * 
 * Uso:
 * <app-skeleton-loader [type]="'text'" [count]="3"></app-skeleton-loader>
 * <app-skeleton-loader [type]="'card'"></app-skeleton-loader>
 * <app-skeleton-loader [type]="'avatar'"></app-skeleton-loader>
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      <!-- Text Skeleton -->
      <ng-container *ngIf="type === 'text'">
        <div *ngFor="let _ of counter(count)" class="skeleton skeleton-text" [style.width]="randomWidth()"></div>
      </ng-container>

      <!-- Card Skeleton -->
      <ng-container *ngIf="type === 'card'">
        <div *ngFor="let _ of counter(count)" class="skeleton-card-wrapper">
          <div class="skeleton skeleton-card"></div>
        </div>
      </ng-container>

      <!-- Avatar Skeleton -->
      <ng-container *ngIf="type === 'avatar'">
        <div *ngFor="let _ of counter(count)" class="skeleton-avatar-wrapper">
          <div class="skeleton" [class.skeleton-avatar]="size === 'small'" [class.skeleton-avatar-large]="size === 'large'"></div>
        </div>
      </ng-container>

      <!-- List Item Skeleton -->
      <ng-container *ngIf="type === 'list-item'">
        <div *ngFor="let _ of counter(count)" class="skeleton-list-item">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton-list-content">
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
            <div class="skeleton skeleton-text-short" style="width: 50%;"></div>
          </div>
        </div>
      </ng-container>

      <!-- Image Skeleton -->
      <ng-container *ngIf="type === 'image'">
        <div *ngFor="let _ of counter(count)" class="skeleton skeleton-image" [style.height.px]="height"></div>
      </ng-container>

      <!-- Button Skeleton -->
      <ng-container *ngIf="type === 'button'">
        <div *ngFor="let _ of counter(count)" class="skeleton skeleton-button"></div>
      </ng-container>

      <!-- Custom Skeleton -->
      <ng-container *ngIf="type === 'custom'">
        <div class="skeleton" [style.width]="width" [style.height]="height"></div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton-container {
      padding: 8px 0;
    }

    .skeleton-card-wrapper {
      margin-bottom: 16px;
    }

    .skeleton-avatar-wrapper {
      display: inline-block;
      margin-right: 12px;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
    }

    .skeleton-list-content {
      flex: 1;
    }

    .skeleton-image {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .skeleton-button {
      height: 40px;
      width: 120px;
      border-radius: 8px;
      margin-bottom: 8px;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'card' | 'avatar' | 'list-item' | 'image' | 'button' | 'custom' = 'text';
  @Input() count: number = 1;
  @Input() size: 'small' | 'large' = 'small';
  @Input() width: string = '100%';
  @Input() height: string | number = '200px';

  counter(n: number): any[] {
    return new Array(n);
  }

  randomWidth(): string {
    const widths = ['100%', '90%', '80%', '95%', '85%'];
    return widths[Math.floor(Math.random() * widths.length)];
  }
}
