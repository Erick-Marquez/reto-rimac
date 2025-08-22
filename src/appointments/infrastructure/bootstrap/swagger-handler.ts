import { APIGatewayProxyHandler } from "aws-lambda";
import * as fs from "fs";

export const swaggerHandler: APIGatewayProxyHandler = async () => {

  // leer el archivo
  const file = fs.readFileSync("./src/appointments/infrastructure/swagger/swagger.yaml", "utf8");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
    <script>
      const spec = \`${file}\`;
      SwaggerUIBundle({
        spec: jsyaml.load(spec),
        dom_id: '#swagger-ui'
      });
    </script>
    
  </body>
  </html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html,
  };
};