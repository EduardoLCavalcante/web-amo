# Backend mockado por API HTTP

## Resumo

Implementar a API no próprio Next.js, com dados mockados mantidos em memória até o processo reiniciar. Todas as telas passarão a ler e alterar dados por chamadas `fetch` reais. Não haverá banco de dados, serviço externo ou envio de e-mail. Os [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) atenderão ao contrato HTTP; a sessão será gravada em cookie pelo servidor.

## Implementação

- Mover os dados iniciais e as credenciais para um módulo exclusivo do servidor. Reaproveitar os tipos e mocks existentes; retirar senhas das respostas da API.
- Trocar o `localStorage` e as atualizações diretas de `useAmoStore()` por um estado compartilhado na aplicação: `GET /api/bootstrap` carrega os dados permitidos ao usuário; após cada alteração bem-sucedida, o cliente consulta esse endpoint novamente. Exibir carregamento e erro, e só navegar após confirmação da API.
- Criar autenticação mockada com login, logout e sessão em cookie `HttpOnly`. O layout exigirá o cookie e o bootstrap validará a sessão antes de mostrar as telas internas; cada operação da API validará sessão, papel e vínculo. O `proxy.ts` fará apenas o redirecionamento inicial, sem depender de memória compartilhada com a aplicação.
- Converter o cadastro de aluno em etapas atendidas pela API. O código gerado ficará visível na interface do protótipo, terá validade de 10 minutos e será exigido antes da criação da conta. A recuperação de senha usará o mesmo princípio, sem e-mail real.
- Converter os formulários públicos de professor e monitor em solicitações pendentes. Adicionar e-mail ao formulário de professor e seleção de curso a ambos. O administrador poderá aprovar ou rejeitar; na aprovação, a API criará a conta e mostrará uma senha temporária uma única vez.
- Separar notificações, configurações e dados pessoais por usuário. Catálogo e fórum serão compartilhados. Estudantes verão seus agendamentos; docentes e monitores verão os vinculados às suas monitorias; o administrador terá visão geral.

## Perfis e permissões

| Recurso | Aluno | Monitor | Professor | Administrador |
| --- | --- | --- | --- | --- |
| Cursos, monitorias e fórum | Consultar | Consultar | Consultar | Consultar e administrar catálogo |
| Dúvidas e respostas | Publicar; editar ou excluir as próprias | Mesmas ações do aluno; moderar monitorias vinculadas | Publicar; moderar monitorias vinculadas | Moderar todas |
| Agendamentos | Solicitar, alterar e cancelar os próprios | Mesmas ações do aluno; decidir os das monitorias vinculadas | Decidir os das monitorias vinculadas | Consultar e gerenciar todos |
| Frequência | Consultar a própria | Consultar a própria; registrar e exportar nas monitorias vinculadas | Registrar e exportar nas monitorias vinculadas | Consultar e gerenciar todas |
| Perfil, notificações e preferências | Apenas os próprios | Apenas os próprios | Apenas os próprios | Os próprios; gerenciar contas |
| Cadastros, aprovações e vínculos | Solicitar cadastro | Solicitar cadastro | Solicitar cadastro | Aprovar, rejeitar, criar contas internas e atribuir monitorias |

- Monitor acumula ações de aluno. Professor participa do fórum, mas não solicita atendimento. Administrador modera e gerencia registros, mas não publica dúvidas, respostas ou agendamentos em nome próprio.
- O administrador atribui professor e monitor às monitorias na aprovação ou na gestão de usuários. Sem vínculo, o profissional não gerencia a monitoria.
- Sem sessão, ficam disponíveis apenas autenticação, recuperação, solicitações de cadastro e `GET /api/catalog`. Contas desativadas não acessam dados. A opção global de permitir cadastros pertence ao administrador.
- A API filtra cada leitura e valida cada alteração. A navegação oculta ações não autorizadas, mas a permissão é sempre verificada no servidor. Dados pessoais de terceiros e senhas não entram nas respostas comuns.

## Contrato e permissões

- `GET /api/catalog` fornecerá dados necessários aos cadastros públicos. `GET /api/bootstrap` devolverá usuário atual e dados filtrados por papel, sempre sem senhas.
- Rotas `/api/auth/*` atenderão login, logout, sessão, cadastro, verificação e recuperação. Rotas `/api/forum/*`, `/api/appointments/*`, `/api/attendance`, `/api/me/*` e `/api/admin/*` receberão as alterações dos respectivos módulos. Os corpos usarão os campos dos tipos atuais; IDs, autor, datas e status iniciais serão definidos pelo servidor.
- A API retornará `{ data }` em sucesso e `{ error }` em falha, com `400` para entrada inválida, `401` sem sessão, `403` sem permissão, `404` para registro ausente e `409` para conflitos. Usará a validação já disponível no projeto.
- Administração e criação de usuários internos exigirão papel de administrador; frequência e decisões sobre agendamentos exigirão papel docente, monitor ou administrador. Cada usuário poderá alterar apenas seu perfil, senha e preferências. O botão de desativar conta passará a desativar a própria conta; restaurar mocks ficará restrito ao administrador.

## Verificação e premissas

- Verificar por teste HTTP o login, cookie, bloqueio por papel, ausência de senha nas respostas, cadastro com código, aprovação de solicitação, isolamento entre usuários e alterações em fórum, agenda e frequência. Conferir também os fluxos nas telas e executar typecheck e build após instalar as dependências.
- O armazenamento em memória pressupõe uma única instância local do Next.js; reinício, recompilação do handler em desenvolvimento ou nova implantação podem apagar alterações e invalidar sessões. Dados antigos do `localStorage` não serão migrados. Não serão adicionadas dependências novas.
- O build de produção concluiu a checagem de TypeScript com sucesso após a instalação das dependências.
