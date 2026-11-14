
# Nosso Minecraft 🌍

Nosso pequeno mundo 3D, feito com JavaScript e Three.js.

## Como executar localmente

1. Baixe os quatro arquivos.
2. Coloque todos na mesma pasta.
3. Abra a pasta com um servidor local, por exemplo:
   - VS Code + extensão Live Server.
   - Python: `python -m http.server 8000`
4. Acesse http://localhost:8000.

O projeto utiliza Three.js por CDN, portanto precisa de conexão com a internet.

## Como publicar no GitHub Pages

1. Crie um repositório chamado `nosso-minecraft`.
2. Envie os arquivos para a raiz do repositório.
3. Abra Settings > Pages.
4. Escolha Deploy from a branch.
5. Selecione `main` e `/ (root)`.
6. Clique em Save.

## Controles

### Computador
- W / S: andar para frente e para trás.
- A / D: virar.
- E: interagir, coletar ou entrar no carro.
- Espaço: pular.

### Celular
- Botões direcionais: movimentar.
- Coletar: pegar madeira ou entrar no carro.
- Pular: saltar.
- Dentro do carro: controles de direção e botão para sair.

## Arquitetura atual

- `index.html`: interface e carregamento.
- `style.css`: HUD e controles.
- `game.js`: cena, personagem, mundo e veículo.

## Próximas funcionalidades

- Inventário com slots.
- Construção e destruição de blocos.
- Crafting e fornalha.
- Biomas.
- Sistema de veículos.
- Aviões e aeroportos.
- Salvamento dos mundos.
- Editor de fases.

## Observações

Esta é uma versão experimental. Os objetos são gerados
por geometria procedural simples, sem assets externos.

O mundo ainda não possui salvamento persistente.

