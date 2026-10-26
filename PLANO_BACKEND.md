# Demonstração do Web-AMO

A interface usa o motor mock existente diretamente no navegador. A base inicial, em `lib/amo/demo-state.json`, corresponde aos dados locais usados para os testes e também alimenta os fluxos de demonstração na Vercel.

`apiRequest()` mantém as chamadas e os contratos das telas. O motor valida cada operação e devolve os mesmos dados e erros. `localStorage` conserva a base de teste, as solicitações, as preferências, as sessões e os códigos temporários nesse navegador. Os códigos e as sessões continuam com os prazos definidos pelo motor.

Não há API de demonstração no servidor nem persistência compartilhada entre visitantes. A restauração do perfil administrador recupera o arquivo de dados versionado. Os dados são fictícios; essa autenticação serve apenas à demonstração.

Execute `npm run test:smoke` para conferir os fluxos e permissões sem iniciar o servidor. Execute `npm run build` antes de publicar a alteração.
