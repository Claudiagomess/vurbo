# vurbo-backend

API da plataforma Vurbo. Java 21 e Spring Boot 4.1.

Por omissão usa uma base H2 em `backend/data`. Para PostgreSQL:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/vurbo
export SPRING_DATASOURCE_USERNAME=vurbo
export SPRING_DATASOURCE_PASSWORD=vurbo
export SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

Fora de desenvolvimento, defina também `VURBO_JWT_SECRET` e `VURBO_ADMIN_PASSWORD`.

```bash
./mvnw test
./mvnw spring-boot:run
```

A primeira conta de empresa é criada no arranque se ainda não existir: `admin` / `admin123`, salvo se `VURBO_ADMIN_USERNAME` e `VURBO_ADMIN_PASSWORD` estiverem definidos.
