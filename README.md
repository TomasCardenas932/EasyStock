<div align="center">

# EasyStock

**Sistema de gestión de inventario para una casa de repuestos de motos**

[Tablero de Trello](https://trello.com/b/iBgxIsqn/proyecto-integradoreasystock) 

</div>

---

## Descripción

EasyStock centraliza el control de stock de un comercio de repuestos de motos que hoy se
administra de forma manual. El negocio maneja varios miles de referencias —filtros, kits de
transmisión, pastillas de freno, lubricantes, cubiertas y repuestos de motor— provenientes de
distintos proveedores, cada uno con su propia codificación, lo que genera diferencias entre el
stock registrado y el stock físico.

El sistema unifica el catálogo de artículos, proveedores y precios en una única base de datos,
actualiza las existencias a partir de las ventas, las facturas de compra y los ajustes de
inventario, y anticipa los faltantes mediante avisos y sugerencias de reposición basadas en un
umbral mínimo por artículo. Además, ofrece al gerente informes y gráficos sobre los movimientos
de caja y el estado general del inventario.


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
## Autor

**Tomás Cárdenas** — Análisis, diseño y desarrollo del proyecto.

---

<div align="center">
<sub>Proyecto Integrador · Release Diciembre 2026</sub>
</div>
