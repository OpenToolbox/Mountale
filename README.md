# Description

Mountale est une **application d'écriture** avec laquelle il est possible d'obtenir :

- des documents HTML bien mis en forme (pour publier des articles de blog par exemple);
- des documents FODT (ouvrables avec LibreOffice Writer avec des styles personnalisés et pratiques).

Fonctionnalités interessantes :

- copier/coller de contenus web ou de textes dans LibreOffice et génération propre du document Mountale;
- syntaxe intuitive (qui ressemble un peu au Markdown) pour définir des types de blocs et des types de textes;
- aperçu HTML.

# Utilisation

Il est possible de **tester Mountale** à cette adresse : http://mountale.xyz.

Conserver la version actuelle du logiciel :

Il faut récupérer tous le contenu sur son ordinateur dans un dossier, décompresser ce dernier et le placer où l'on veut. Il suffit ensuite d'ouvrir le fichier index.html avec un navigateur web (Chrome, Firefox et Opera actuellement (peut-être Safari, à vous de me dire, je n'ai pas pu essayer)). L'installation sur son propre ordinateur peut-être utile, car la version disponible sur mountale.xyz peut changer (ce qui peut amener à une perte de compatibilité des documents créés).

Une bonne astuce est d'installer le dossier à un endroit peu accessible dans l'ordinateur, d'ouvrir le fichier index.html dans un navigateur, puis dans ce navigateur, mettre la page en favoris pour y accéder rapidement.

Une documentation complète sera prochainement disponible.

# Développeurs

L'application dispose d'une bonne part de javascript pur (vanilla JS). Le dossier app/browser/core contient tous les fichiers nécessaires à l'amélioration de l'application. Mountale est sous licence AGPLv3 et qui veut participer à son développement peut me le faire savoir.

## Dependencies

To run mountale in development you need to install **Node.js** and **npm** : https://nodejs.org.

Electron 0.37 is required :

    $ npm install -g electron-prebuilt@0.37

## Installation

    $ git clone https://github.com/opentoolbox/mountale.git
    $ cd mountale
    $ npm install

## Run Mountale

    $ npm start

## Build Mountale

To build mountale with [electron-builder](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build) you need to [install required system packages](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build).

    $ npm run pack
    $ npm run dist
