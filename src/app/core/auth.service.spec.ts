import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';
import { ApiService } from './api.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let storageService: jasmine.SpyObj<SecureStorageService>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    // Crear mocks
    const storageSpy = jasmine.createSpyObj('SecureStorageService', ['set', 'get', 'remove']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SecureStorageService, useValue: storageSpy },
        { provide: ApiService, useValue: apiSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    storageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test: setAccessToken
  it('should set access token', async () => {
    const token = 'test-access-token-123';
    storageService.set.and.returnValue(Promise.resolve());

    await service.setAccessToken(token);

    expect(storageService.set).toHaveBeenCalledWith('access_token', token);
  });

  // Test: getAccessToken
  it('should get access token', async () => {
    const token = 'test-access-token-123';
    storageService.get.and.returnValue(Promise.resolve(token));

    const result = await service.getAccessToken();

    expect(storageService.get).toHaveBeenCalledWith('access_token');
    expect(result).toBe(token);
  });

  // Test: setRefreshToken
  it('should set refresh token', async () => {
    const token = 'test-refresh-token-456';
    storageService.set.and.returnValue(Promise.resolve());

    await service.setRefreshToken(token);

    expect(storageService.set).toHaveBeenCalledWith('refresh_token', token);
  });

  // Test: getRefreshToken
  it('should get refresh token', async () => {
    const token = 'test-refresh-token-456';
    storageService.get.and.returnValue(Promise.resolve(token));

    const result = await service.getRefreshToken();

    expect(storageService.get).toHaveBeenCalledWith('refresh_token');
    expect(result).toBe(token);
  });

  // Test: clearTokens
  it('should clear all tokens', async () => {
    storageService.remove.and.returnValue(Promise.resolve());

    await service.clearTokens();

    expect(storageService.remove).toHaveBeenCalledWith('access_token');
    expect(storageService.remove).toHaveBeenCalledWith('refresh_token');
  });

  // Test: refreshToken - Success
  it('should refresh token successfully', async () => {
    const oldRefresh = 'old-refresh-token';
    const newAccess = 'new-access-token';
    const newRefresh = 'new-refresh-token';

    // Simular que hay un refresh token guardado
    storageService.get.and.callFake((key: string) => {
      if (key === 'refresh_token') return Promise.resolve(oldRefresh);
      return Promise.resolve(null);
    });

    // Simular respuesta del API
    apiService.post.and.returnValue(
      of({ access_token: newAccess, refresh_token: newRefresh })
    );

    storageService.set.and.returnValue(Promise.resolve());

    const result = await service.refreshToken();

    expect(result).toBe(newAccess);
    expect(storageService.set).toHaveBeenCalledWith('access_token', newAccess);
    expect(storageService.set).toHaveBeenCalledWith('refresh_token', newRefresh);
  });

  // Test: refreshToken - Failure (no refresh token)
  it('should return null if no refresh token exists', async () => {
    storageService.get.and.returnValue(Promise.resolve(null));

    const result = await service.refreshToken();

    expect(result).toBeNull();
  });

  // Test: refreshToken - API Error
  it('should handle refresh token API failure', async () => {
    const oldRefresh = 'old-refresh-token';
    storageService.get.and.returnValue(Promise.resolve(oldRefresh));
    apiService.post.and.returnValue(
      throwError(() => new Error('API error'))
    );
    storageService.remove.and.returnValue(Promise.resolve());

    const result = await service.refreshToken();

    expect(result).toBeNull();
    expect(storageService.remove).toHaveBeenCalled();
  });

  // Test: logout/clearTokens
  it('should clear tokens on logout', async () => {
    storageService.remove.and.returnValue(Promise.resolve());

    await service.clearTokens();

    expect(storageService.remove).toHaveBeenCalledWith('access_token');
    expect(storageService.remove).toHaveBeenCalledWith('refresh_token');
  });
});
