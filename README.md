# Vurbo

Site da Vurbo, Vurbo Air, Vurbo Rent e Vurbo Care. A área reservada liga à API em `vurbo-backend`.

## Correr localmente

Na pasta da API:

```bash
mvn spring-boot:run
```

Nesta pasta:

```bash
npm install
npm start
```

O site abre em `http://localhost:4200`. Em desenvolvimento, `public/config.json` deixa o endereço da API vazio e o `ng serve` encaminha `/api` para `http://localhost:8080`. Antes de publicar na Vercel, muda `apiUrl` para o endereço da API no Render.

Conta local de administração, criada pela API: `admin@vurbo.pt` / `admin123`.

## O que faz cada área

- **Vurbo** e **Vurbo Air**: o cliente pede orçamento. A administração define o custo (visível ao cliente) e a remuneração (visível ao técnico). O cliente aceita ou recusa. Só depois de aceitar é que os técnicos veem o pedido e se candidatam. A administração escolhe um técnico.
- **Vurbo Rent** e **Vurbo Care**: páginas de explicação com pedido de contacto. O renting e a subscrição ainda não têm contratação nem pagamento.

Clientes registam-se e ficam ativos. Técnicos registam-se e ficam pendentes até um administrador aprovar. Novos administradores não se registam no site.

## Publicar

- Site: Vercel, a partir deste repositório. O `vercel.json` trata das rotas da aplicação.
- API: Render, a partir de `vurbo-backend`.
- Dados e fotos: Supabase. Antes de publicar, muda `public/config.json` para o endereço da API no Render e, na API, `CORS_ORIGINS` para o endereço Vercel.
