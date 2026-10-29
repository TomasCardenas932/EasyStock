<div align="center">

# EasyStock

**Sistema de gestión de inventario para una casa de repuestos de motos**

[Tablero de Trello](https://trello.com/b/iBgxIsqn/proyecto-integradoreasystock) 

</div>

---

## Descripción

EasyStock centraliza el control de stock de un comercio de repuestos de motos que hoy se
administra de forma manual. El negocio maneja varios miles de referencias filtros, kits de
transmisión, pastillas de freno, lubricantes, cubiertas y repuestos de motor provenientes de
distintos proveedores, cada uno con su propia codificación, lo que genera diferencias entre el
stock registrado y el stock físico.

El sistema unifica el catálogo de artículos, proveedores y precios en una única base de datos,
actualiza las existencias a partir de las ventas y de las entradas de mercadería, y anticipa los
faltantes con un Dashboard que muestra los artículos sin stock, los que hay que reponer según un
umbral mínimo por artículo y los que no tienen precio al público. Cada usuario ingresa con su
email y su contraseña, y su rol define qué pantallas puede usar. La interfaz se puede usar en
modo claro o en modo oscuro.


## Como usar

Para poder usar el sistema se debe entrar a la terminal de windows y en la carpeta de backend y frontend se debe hacer lo siguiente:

1. En tu primera vez usando el programa usar este comando para instalar todos los modulos necesarios: 
    ```
    npm i
    ```

2. Usar los siguientes comandos para tener la base de datos al dia y con articulso de prueva
    ```
    npm run db:migrate && npm run db:seed
    ```

3. Para el correcto funcionamiento se debe ejecutar en dos consolas por separado el siguiente comando en la carpeta de frontend y backend:
    ```
    npm run dev
    ```

4. Abrir http://localhost:5173 e iniciar sesión con el email y la contraseña del usuario administrador que carga el seeder `backend/src/seeders/20261022140000-admin-inicial.js`. Desde el menú del usuario, arriba a la derecha, se administran los usuarios y se cierra la sesión; el switch de al lado alterna entre el modo claro y el oscuro.

5. La documentación de la API, con las pruebas de cada endpoint, está en Swagger: con el backend corriendo, abrir http://localhost:3001/api-docs (o http://localhost:3001/api/docs). Desde ahí se pueden probar los endpoints con "Try it out", después de iniciar sesión con `POST /sesion`.

6. Para correr esas mismas pruebas de forma automática, en la carpeta de backend (usan una base temporal en memoria, no tocan la de desarrollo):
    ```
    npm test
    ```

## Autor

**Tomás Cárdenas**  Análisis, diseño y desarrollo del proyecto.

---

<div align="center">
<sub>Proyecto Integrador · Release Noviembre 2026</sub>
</div>
