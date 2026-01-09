# PWA Icons

## Como gerar os ícones PNG

Os ícones SVG estão em `logo192.svg` e `logo512.svg`.

Para converter para PNG, use uma das seguintes opções:

### Opção 1: Online

- Acesse https://www.adobe.com/express/feature/image/convert/svg-to-png
- Faça upload dos arquivos SVG
- Baixe como PNG

### Opção 2: ImageMagick (comando)

```bash
magick logo192.svg logo192.png
magick logo512.svg logo512.png
```

### Opção 3: Canva / Figma

- Importe o SVG
- Exporte como PNG nas dimensões corretas

## Favicon

O favicon.ico pode ser gerado a partir do logo192.png usando:

- https://favicon.io/favicon-converter/
- Ou qualquer conversor de PNG para ICO

## Temporário

Por enquanto, o app funciona com os SVGs. Para produção, gere os PNGs e substitua os arquivos.
