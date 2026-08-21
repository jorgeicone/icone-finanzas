# Mapa de Capacidades · Universidad EAN

Memoria del proyecto. No es código de ICONE Finanzas: vive aquí porque esta
sesión trabajaba sobre este repositorio. El código del diagnóstico está en otro
lado (ver *Dónde vive el código*).

> Este repositorio es público. Este documento no lleva correos de acceso,
> contraseñas, identificadores de proyecto de Supabase ni tokens. Esos datos
> están en el gestor de credenciales de Jorge.

## Qué es

Diagnóstico empresarial que mide capacidades organizacionales y devuelve una
**Ruta de Fortalecimiento** con programas del portafolio EAN 2026. Su función
comercial es generar leads B2B para la Universidad EAN.

- En línea: https://iconeialabs.com/mapa-de-capacidades/
- Panel de administración: la misma URL con `#admin`. Entra con las
  credenciales de Supabase de Jorge (las mismas de ICONE Finanzas).

## La decisión que no hay que deshacer

El portafolio tiene **10 clusters**, pero el instrumento pregunta por
**6 dimensiones de capacidad**, no por cluster.

Los clusters son taxonomía de *oferta*, no de *necesidad*. Aparecen únicamente
en el informe, al momento de recomendar programas. Si alguien propone «una
dimensión por cluster», esa conversación ya se tuvo y se cerró.

## Instrumento

- 30 preguntas: 5 por cada una de las 6 dimensiones.
- Escala conductual de 0 a 3.
- Duración estimada: ~10 minutos.
- Informe con radar hexagonal, barras, top 3 de brechas y ruta en 3 fases.

## Dónde vive el código

Carpeta local, con git propio:

```
24. EAN Empresas\1. Diagnosticos empresariales\dx-ean-empresas\
```

Tres archivos —`index.html`, `app.js`, `engine.js`— más `img/`. Sin build.

No tiene repositorio remoto propio: `gh repo create` lo bloquea el clasificador.

## Cómo se publica

Se copian esos archivos a la subcarpeta `mapa-de-capacidades/` del repositorio
`jorgeicone/iconeialabs` (el que sirve iconeialabs.com) y se empuja.

Dos cosas que cuestan tiempo si no se saben:

1. **Clonar en ruta corta**, tipo `/c/tmp-ean`. Clonar dentro de OneDrive falla
   con «Filename too long».
2. **GitHub Pages tarda entre 1 y 5 minutos** y el CDN sirve caché. Antes de
   suponer que el despliegue falló, verificar el build y forzar la recarga:

   ```sh
   gh api repos/jorgeicone/iconeialabs/pages/builds -q '.[0].status'
   ```

   y abrir la URL con `?v=` al final.

## Datos

Los diagnósticos se guardan en la tabla `ean_diagnosticos` de un proyecto de
Supabase compartido con la App de Profes y el Bootcamp PC.

Reglas de acceso (RLS):

- La llave `anon` solo puede **INSERT**.
- El **SELECT** está restringido al `user_id` de Jorge, **no** al rol
  `authenticated`. La razón: los 151 estudiantes del mismo proyecto entran como
  `authenticated` y podrían leer los leads.

## Habeas data

- **Responsable**: Universidad EAN.
- **Encargado**: ICONE.
- **Canal de contacto**: jorgehugoperez@iconeialabs.com
- **Política vigente**: 2.1-2026-08.

Al editar el aviso de privacidad hay que subir `POLITICA_VERSION` en `app.js`.

## Pendientes (bloquean salir a cliente real)

- [ ] NIT y correo oficial de habeas data de la EAN.
- [ ] Acuerdo escrito de encargo de datos.
- [ ] Validación de las 30 preguntas por parte de la EAN.
- [ ] Logo en archivo original: el actual es un recorte de JPEG.
- [ ] Envío del informe por correo. Falta una cuenta tipo Resend.

## Cerrado

- **2026-08-21** — Borrados los tres tokens de GitHub. El skill `github-deploy`
  quedó reescrito sin credenciales (v0.2.0). Verificado que `gh` y el sitio
  siguen funcionando.
