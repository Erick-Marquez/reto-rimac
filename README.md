
# Prueba





## Instalación

Instalación del proyecto de manera local

```bash
  npm install && npm run start
```
## Despliegue

Para desplegar la aplicacion en produccion

```bash
  npm run deploy
```


## Running Tests

Ejecutar el siguiente comando para realizar los tests

```bash
  npm run test
```


## API Reference

Puedes consultar la documentación completa en Swagger:  
`POST {url}/dev/docs`  


### Endpoints principales

- **Crear una cita**  
  `POST {url}/dev/appointment`  

- **Obtener una cita por ID**  
  `GET {url}/dev/appointment/{id}`  



## Comentarios

Se implementó la arquitectura solicitada, con la excepción del almacenamiento de citas en AWS RDS. Actualmente, este se ha reemplazado por dos servicios en DynamoDB, y a nivel de código, el servicio está diseñado mediante una interfaz hacia el repositorio, lo que permitiría un cambio más rápido a RDS, ya que solo sería necesario implementar la conexión específica.


## Tech Stack

TS, Serverless, jest, swagger, 
API Gateway, Lambdas, DynamoDB, SNS, SQS y EventBridge.



## Author

- [@Erick Marquez](https://gitlab.com/Erick-Marquez)

