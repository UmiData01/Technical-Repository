import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EstadoForm {
  nome: string;
  sigla: string;
  ibge: string;
}

@Component({
  selector: 'app-adicionar-estado-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adicionar-estado-modal.html',
  styleUrls: ['./adicionar-estado-modal.css']
})
export class AdicionarEstadoModalComponent implements OnChanges {
  @Input() aberto: boolean = false;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<EstadoForm>();
  @Output() excluir = new EventEmitter<string>(); // 🔴 Novo emissor de evento

  nome = '';
  sigla = '';
  ibge = '';
  erro = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['aberto']?.currentValue === true) {
      this.resetForm();
    }
  }

  resetForm() {
    this.nome = '';
    this.sigla = '';
    this.ibge = '';
    this.erro = '';
  }

  fecharModal() {
    this.fechar.emit();
  }

  excluirEstado() {
    if (!this.sigla) {
      this.erro = 'Preencha ao menos a Sigla para excluir um estado.';
      return;
    }
    this.excluir.emit(this.sigla.toUpperCase());
  }

  confirmar() {
    if (!this.nome || !this.sigla || !this.ibge) {
      this.erro = 'Preencha todos os campos.';
      return;
    }
    if (this.sigla.length < 2 || this.sigla.length > 3) {
      this.erro = 'Sigla deve ter 2 ou 3 letras.';
      return;
    }
    this.salvar.emit({
      nome: this.nome,
      sigla: this.sigla.toUpperCase(),
      ibge: this.ibge
    });
  }

  @HostListener('click', ['$event'])
  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-ov')) {
      this.fecharModal();
    }
  }
}