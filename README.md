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
### Criar um arquivo .env com suas configurações:
```
SECRET_KEY=sua_chave_secreta
MONGO_URI=sua_uri_do_mongodb_atlas
```
### Iniciar o servidor:
```sh
python run.py
```
### Acessar o sistema:

Em um navegador de internet, acessar o endereço http://127.0.0.1:5000

## Dupla:

- Guilherme Henrique Alves Pereira | RA: 202112033
- Hugo Soares Guimarães | RA: 201910099
