import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api';
import { AuthService } from '../core/auth';
import { errorMessage } from '../core/models';

interface PageCopy {
  kicker: string;
  title: string;
  lede: string;
  points: string[];
  topic?: 'RENT' | 'CARE';
  actions: { label: string; link: string; query?: Record<string, string> }[];
}

const PAGES: Record<string, PageCopy> = {
  vurbo: {
    kicker: 'Vurbo',
    title: 'Assistência e reparação de eletrodomésticos.',
    lede: 'Registas o pedido com os dados do aparelho, a foto da etiqueta, o que está a falhar e onde está a máquina. A Vurbo responde com um orçamento.',
    points: [
      'Máquinas de lavar, loiça, frio, fornos, esquentadores e o resto da cozinha e da lavandaria.',
      'O orçamento mostra só o custo para ti.',
      'Se aceitares, o pedido abre para técnicos da zona.',
    ],
    actions: [{ label: 'Pedir orçamento', link: '/cliente', query: { novo: 'reparacao', linha: 'VURBO' } }],
  },
  air: {
    kicker: 'Vurbo Air',
    title: 'Ar condicionado, da avaria à instalação.',
    lede: 'A reparação segue o mesmo caminho de um eletrodoméstico. A instalação pede a área, quantos equipamentos queres, a marca de preferência e a morada.',
    points: [
      'Reparação com foto da etiqueta e descrição do problema.',
      'Instalação com área em m², número de equipamentos e preferência de marca.',
      'O técnico só vê o trabalho depois de aceitares o orçamento.',
    ],
    actions: [
      { label: 'Reparar ar condicionado', link: '/cliente', query: { novo: 'reparacao', linha: 'VURBO_AIR' } },
      { label: 'Pedir instalação', link: '/cliente', query: { novo: 'instalacao', linha: 'VURBO_AIR' } },
    ],
  },
  rent: {
    kicker: 'Vurbo Rent',
    title: 'Eletrodomésticos para usar, sem os comprares.',
    lede: 'O renting entrega o aparelho em casa mediante uma renda. Diz-nos o que precisas e a Vurbo responde com uma proposta.',
    points: [
      'Útil quando queres o aparelho já, sem o valor da compra de uma vez.',
      'A proposta inclui o equipamento, a renda e a duração.',
      'Nesta fase o pedido fica com a equipa, que te contacta.',
    ],
    topic: 'RENT',
    actions: [],
  },
  care: {
    kicker: 'Vurbo Care',
    title: 'Uma mensalidade para o aparelho não chegar à avaria.',
    lede: 'Compras um eletrodoméstico e podes juntar-lhe o Care: um valor por mês que inclui a visita de um técnico para manutenção e limpeza, os cuidados a ter com a máquina e o aviso quando uma peça deve ser trocada antes de falhar.',
    points: [
      'Funciona como subscrição, associada aos teus aparelhos.',
      'A visita serve para limpar, verificar e explicar o que está a chegar ao fim.',
      'Nesta fase deixas o contacto e a Vurbo combina o plano contigo. Ainda não há cobrança automática.',
    ],
    topic: 'CARE',
    actions: [],
  },
};

@Component({
  selector: 'app-service-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './service-page.html',
})
export class ServicePage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  readonly page = signal(PAGES[this.route.snapshot.data['key'] as string]);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    message: ['', Validators.required],
  });
  error = '';
  sent = false;
  sending = false;

  constructor() {
    this.route.data.subscribe((data) => {
      this.page.set(PAGES[data['key'] as string]);
      this.sent = false;
      this.error = '';
    });
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email, phone: user.phone === '—' ? '' : user.phone });
    }
  }

  async submit(): Promise<void> {
    const topic = this.page().topic;
    if (!topic || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending = true;
    this.error = '';
    try {
      await firstValueFrom(this.api.createLead({ ...this.form.getRawValue(), topic }));
      this.sent = true;
      this.form.reset();
    } catch (error) {
      this.error = errorMessage(error);
    } finally {
      this.sending = false;
    }
  }
}
