# toshokan 図書館 #

Aplicação Web fullstack desenvolvida como projeto acadêmico para gerenciamento de uma biblioteca. O sistema permite o gerenciamento de livros, usuários e requisições, com autenticação, reservas, QR codes e controle de acesso para bibliotecários.

## Stack:

- HTML
- CSS
- Vue.js
- Flask
- MongoDB

## Objetivo: Construir uma biblioteca digital com:

- Design projetado com o Figma, respeitando padrões utilizados na indústria
- Interface interativa e responsiva com Vue.js
- Backend estruturado com Flask
- Banco de dados NoSQL com MongoDB
- Controle de acesso para bibliotecários e usuários
- Operações CRUD para livros e gerenciamento de requisições

## Funcionalidades:

- Autenticação com login e register
- Diferenciação entre usuários comuns e bibliotecários
- Dashboard do usuário com QR codes e reservas
- CRUD de livros com interface para bibliotecários
- Gerenciamento de usuários (suspender, editar, remover)
- Aceitação/rejeição de requisições de livros e registros
- Pesquisa e filtro de livros por nome, autor ou ISBN
- Modais com blur de fundo para interações

## Instalação e execução:

### Acessar a pasta do projeto
```sh
cd toshokan
```

### Criar o ambiente virtual:
```sh
python -m venv venv
```
Linux/macOS
```sh
source venv/bin/activate
```
Windows
```sh
.venv\Scripts\activate
```
### Instalar as dependências:
```sh
pip install -r requirements.txt
```

### Configurar o MongoDB:

#### No Atlas:

- Criar uma nova organização (tanto faz o nome)
- Criar um novo projeto (tanto faz o nome)
- Criar um novo cluster (tanto faz o nome)
- Pegar o endereço da URI par inserir no Compass

### Criar um arquivo .env com suas configurações:
```
MONGO_URI="mongodb+srv://<seu_username>:<sua_senha>@<seu_cluster>/LibraryDb?retryWrites=true&w=majority&appName=LibraryDb"
FLASK_SECRET_KEY=1234
```
Para pegar a URI corretamente, no Mongo Atlas, pegue a conexão para Python (irá conter seu usuário, sua senha e o seu cluster) e altere a parte final (após o .net) para /LibraryDb?retryWrites=true&w=majority&appName=LibraryDb

### Iniciar o servidor:
```sh
python run.py
```
### Acessar o sistema:

Em um navegador de internet, acessar o endereço http://127.0.0.1:5000

O programa automaticamente criará um usuário:
- e-mail: admin@admin.com
- senha: 123

## Dupla:

- Guilherme Henrique Alves Pereira | RA: 202112033
- Hugo Soares Guimarães | RA: 201910099
