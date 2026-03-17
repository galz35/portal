# Checklist Seguridad Para Gemini

## Portal

1. crear `AppError`
2. agregar inicializacion de `tracing`
3. generar `request_id` por request
4. loguear login exitoso y fallido
5. loguear refresh fallido
6. loguear logout y logout-all
7. no exponer errores SQL al cliente
8. agregar timeout y body limit

## Vacantes

1. crear `AppError`
2. agregar inicializacion de `tracing`
3. generar `request_id` por request
4. loguear alta de requisicion
5. loguear aprobacion y rechazo
6. loguear cambio de estado de vacante
7. loguear cambio de estado de postulacion
8. loguear alta de lista negra y terna
9. no exponer errores SQL al cliente
10. agregar timeout y body limit

## CI

1. `cargo fmt --check`
2. `cargo clippy --all-targets --all-features -- -D warnings`
3. `cargo test`
4. `cargo audit`
5. `cargo deny check`
