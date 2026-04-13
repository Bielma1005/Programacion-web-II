// Importaciones principales de Angular
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

//  Interfaz que define la estructura de cada actividad
export interface Actividad {
  nombre: string;
  materia: string;
  fecha: string;
  prioridad: 'Alta' | 'Media' | 'Baja'; // valores controlados
  completada: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true, // Componente standalone (requerido)
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  //  SIGNAL PRINCIPAL (estado reactivo de la app)
  actividades = signal<Actividad[]>([]);

  //  SIGNAL PARA FILTROS
  filtro = signal<'todas' | 'pendientes' | 'completadas'>('todas');

  //  VARIABLES DEL FORMULARIO (enlazadas con ngModel)
  nombre = '';
  materia = '';
  fecha = '';
  prioridad: 'Alta' | 'Media' | 'Baja' = 'Media';

  //  CICLO DE VIDA: cargar datos guardados
  ngOnInit() {
    const data = localStorage.getItem('actividades');
    if (data) {
      this.actividades.set(JSON.parse(data));
    }
  }

  //  GUARDAR AUTOMÁTICAMENTE (cada vez que cambia el estado)
  guardarDatos() {
    localStorage.setItem('actividades', JSON.stringify(this.actividades()));
  }

  //  COMPUTED: total de actividades
  total = computed(() => this.actividades().length);

  //  COMPUTED: actividades pendientes
  pendientes = computed(() =>
    this.actividades().filter(a => !a.completada).length
  );

  //  COMPUTED: actividades completadas
  completadas = computed(() =>
    this.actividades().filter(a => a.completada).length
  );

  // COMPUTED: filtrado dinámico
  actividadesFiltradas = computed(() => {
    switch (this.filtro()) {
      case 'pendientes':
        return this.actividades().filter(a => !a.completada);
      case 'completadas':
        return this.actividades().filter(a => a.completada);
      default:
        return this.actividades();
    }
  });

  //  FUNCIÓN: agregar nueva actividad
  agregarActividad() {
    // Validación: evita campos vacíos o con espacios
    if (!this.nombre.trim() || !this.materia.trim() || !this.fecha) return;

    const nueva: Actividad = {
      nombre: this.nombre.trim(),
      materia: this.materia.trim(),
      fecha: this.fecha,
      prioridad: this.prioridad,
      completada: false
    };

    // Inserta la nueva actividad al inicio
    this.actividades.update(lista => [nueva, ...lista]);

    // Guardar cambios
    this.guardarDatos();

    // Limpiar formulario
    this.nombre = '';
    this.materia = '';
    this.fecha = '';
    this.prioridad = 'Media';
  }

  //  FUNCIÓN: cambiar estado (pendiente/completada)
  toggleEstado(index: number) {
    this.actividades.update(lista =>
      lista.map((act, i) =>
        i === index
          ? { ...act, completada: !act.completada } // evita mutación directa
          : act
      )
    );

    // Guardar cambios
    this.guardarDatos();
  }

  //  FUNCIÓN: eliminar actividad
  eliminar(index: number) {
    this.actividades.update(lista =>
      lista.filter((_, i) => i !== index) // forma inmutable
    );

    // Guardar cambios
    this.guardarDatos();
  }
}