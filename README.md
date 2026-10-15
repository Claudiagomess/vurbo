# Vurbo

Plataforma para publicar reparações de eletrodomésticos e receber candidaturas de técnicos, por ordem de interesse.

O frontend Angular fica neste repositório. A API Java está em `backend/` enquanto o Cursor não tiver permissão de escrita em [vurbo-backend](https://github.com/Claudiagomess/vurbo-backend). O repositório já existe e está vazio; o GitHub recusou o push do `cursor[bot]` com 403.

## Arranque

Num terminal, a API:

```bash
cd backend
./mvnw spring-boot:run
```

Noutro, o site:

```bash
npm start
```

Abra http://localhost:4200.

A conta inicial da empresa é `admin` / `admin123`. Crie os técnicos em Técnicos e mude a palavra-passe em Conta.

## O que cada lado faz

A empresa entra, cria acessos de técnicos, publica reparações (marca, tipo de aparelho, modelo, localidade e descrição) e vê os interessados do primeiro para o último.

O técnico entra, vê as reparações abertas e candidata-se uma vez a cada uma. A posição é a hora da candidatura.

A documentação da API fica em http://localhost:8080/swagger-ui.html.
