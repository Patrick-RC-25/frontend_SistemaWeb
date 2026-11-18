import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { AlertsService } from './alerts.service';
import { AlertaApi } from '../interfaces/alerta-api.interface';
import { AcademicAlert } from '../interfaces/alert.interface';

const ALERTAS: AlertaApi[] = [
  {
    id_alerta: 1,
    id_usuario: 10,
    id_curso: 3,
    id_tarea: null,
    id_tipo_alerta: 2,
    titulo: 'Entrega de práctica',
    mensaje: 'La práctica vence mañana',
    fecha_programada: '2026-11-17T23:59:00',
    leida: false,
  },
  {
    id_alerta: 2,
    id_usuario: 10,
    id_curso: null,
    id_tarea: null,
    id_tipo_alerta: 3,
    titulo: 'Revisa tu rendimiento',
    mensaje: 'Tu promedio está debajo de tu objetivo',
    fecha_programada: null,
    leida: true,
  },
];

describe('AlertsService', () => {
  let service: AlertsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AlertsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads alerts using the RandomStudyDB API contract', () => {
    let alerts: unknown;
    service.mostrar().subscribe((items) => (alerts = items));
    const request = http.expectOne(`${environment.apiUrl}/alertas`);
    expect(request.request.method).toBe('GET');
    request.flush(ALERTAS);
    expect((alerts as unknown[]).length).toBe(2);
  });

  it('updates the unread count when an alert is marked as read', () => {
    let unread = -1;
    service.unreadCount$().subscribe((total) => (unread = total));
    service.mostrar().subscribe();
    http.expectOne(`${environment.apiUrl}/alertas`).flush(ALERTAS);
    expect(unread).toBe(1);

    service.marcarLeida(1).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/alertas/1/leida`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ ...ALERTAS[0], leida: true });
    expect(unread).toBe(0);
  });

  it('filters alerts by read state and type', () => {
    let alerts: AcademicAlert[] = [];
    service.mostrar().subscribe((items) => (alerts = items));
    http.expectOne(`${environment.apiUrl}/alertas`).flush(ALERTAS);
    expect(service.filtrar('unread', alerts).length).toBe(1);
    expect(service.filtrar('read', alerts).length).toBe(1);
    expect(service.filtrar('task', alerts).length).toBe(1);
    expect(service.filtrar('all', alerts).length).toBe(2);
  });
});
