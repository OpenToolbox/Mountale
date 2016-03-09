/*
    Copyright 2016 - Sven Seitan
    
    This file is part of Mountale.

    Mountale is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Mountale is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Mountale.  If not, see <http://www.gnu.org/licenses/>.
*/


/*global document, localStorage, alert, window, console*/
/*jslint plusplus: true*/
/*jshint esnext: true, strict: true*/
var app = {
    currentDoc: JSON.parse(localStorage.getItem('docs')),
    currentBlock: [],
    
    //contents
    compose: document.getElementById('compose'),
    
    files: document.getElementById('files'),
    inputDocName: document.getElementById('inputDocName'),
    btDocAdd: document.getElementById('btDocAdd'),
    btOpenFile: document.getElementById('btOpenFile'),
    listOfDocs: document.getElementById('listOfDocs'),
    
    htmlPreview: document.getElementById('htmlPreview'),
    
    htmlSource: document.getElementById('htmlSource'),
    htmlSourceContent: document.getElementById('htmlSourceContent'),
    htmlOptsPrefix: document.getElementById('htmlOptsPrefix'),
    htmlOptsFull: document.getElementById('htmlOptsFull'),
    
    source: document.getElementById('source'),
    btExportTale: document.getElementById('btExportTale'),
    sourceContent: document.getElementById('sourceContent'),
    
    odt: document.getElementById('odt'),
    btExportOdt: document.getElementById('btExportOdt'),
    
    //navbars
    nav: document.getElementById('nav'), //inutilisé
    pageName: document.getElementById('pageName'),
    
    btFiles: document.getElementById('btFiles'),
    btHtml: document.getElementById('btHtml'),
    btCompose: document.getElementById('btCompose'),
    btToggleSourcePreview: document.getElementById('btToggleSourcePreview'),
    btSource: document.getElementById('btSource'),
    btOdt: document.getElementById('btOdt'),

    //keys
    ENTER_KEY: 13,
    TAB_KEY: 9,
    RETURN_KEY: 8,

    //markers
    MARKERS: [
        {mark: '\'', html: 'em', entity: '&apos;'},
        {mark: '\'', html: 'i', entity: '&apos;'},
        {mark: '*', html: 'strong', entity: '&ast;'},
        {mark: '*', html: 'b', entity: '&ast;'},
        {mark: '|', html: 'mark', entity: '&verbar;'},
        {mark: '_', html: 'u', entity: '&lowbar;'},
        {mark: '^', html: 'sup', entity: '&Hat;'},
        {mark: ',', html: 'sub', entity: '&comma;'},
        {mark: '`', html: 'code', entity: '&grave;'}
    ],
    OC_MARKERS: [
        {o: '[', c: ']', oh: '&lsqb;', ch: '&rsqb;', type: 'link'},
        {o: '(', c: ')', oh: '&lpar;', ch: '&rpar;', type: 'note'},
        {o: '{', c: '}', oh: '&lcub;', ch: '&rcub;', type: 'image'}
    ],
    
    //links between nav and contents
    inFiles: {
        content: files,
        nav: [btCompose],
        name: 'Files'
    },
    inCompose: {
        content: compose,
        nav: [btFiles, btSource, btOdt, btHtml],
        name: 'Composer'
    },
    inHtmlPreview: {
        content: htmlPreview,
        nav: [btFiles, btCompose, btToggleSourcePreview],
        name: 'HTML preview'
    },
    inHtmlSource: {
        content: htmlSource,
        nav: [btFiles, btCompose, btToggleSourcePreview],
        name: 'HTML code'
    },
    inSource: {
        content: source,
        nav: [btFiles, btCompose],
        name: 'Export source file'
    },
    inOdt : {
        content: odt,
        nav: [btFiles, btCompose],
        name: 'Export FODT file (for LibreOffice and other)'
    },
    allContentAndNav: [
        files, compose, htmlPreview, htmlSource, source, odt,
        btFiles, btCompose, btHtml, btToggleSourcePreview, btSource, btOdt
    ],

    //constants
    HTML_SOURCE: 'HTML_CODE',
    HTML_RENDER: 'HTML_RENDER'
};
if (app.currentDoc) {
    app.currentDoc = app.currentDoc[0];
}

/* All functions */

function setDoc(doc) {
    'use strict';
    var uuids = [], blk, idMax = 0;
    
    if (localStorage.getItem('docs')) {
        uuids = JSON.parse(localStorage.getItem('docs'));
    }
    uuids.unshift(doc.uuid);
    localStorage.setItem('docs', JSON.stringify(uuids));
    localStorage.setItem(doc.uuid + '.blocks', JSON.stringify(doc.blocks));
    console.log('push in LS : blocks', JSON.stringify(doc.blocks));
    localStorage.setItem(doc.uuid + '.name', doc.name);
    if (doc.title) {
        localStorage.setItem(doc.uuid + '.title', doc.title);
    }
    if (doc.author) {
        localStorage.setItem(doc.uuid + '.author', doc.author);
    }
    
    for (blk of doc.blocks) {
        if (blk.id > idMax) {
            idMax = blk.id;
        }
    }
    localStorage.setItem(doc.uuid + '.idMax', idMax);
    app.currentDoc = doc.uuid;
}

function generateUUID() {
    'use strict';
    var
        d = new Date().getTime(),
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r&0x3 | 0x8)).toString(16);
        });

    return uuid;
}

function generateFull(checkbox) {
    'use strict';
    var text, textBefore, textAfter, domFull1, domFull2;
    if (checkbox.checked) {
        text = app.htmlSourceContent.innerHTML;
        textBefore = [
            '&lt;!doctype html&gt;', '<br>',
            '&lt;html&gt;', '<br>',
                '&lt;head&gt;', '<br>',
                    '&lt;title&gt;',
                        '***',
                    '&lt;/title&gt;', '<br>',
                    '&lt;meta charset=utf-8&gt;', '<br>',
                    '&lt;meta author=***&gt;', '<br>',
                '&lt;/head&gt;', '<br>',
                '&lt;body&gt;',
                '<br><br>'
        ];
        textAfter = '<br><br>&lt;/body&gt;<br>&lt;/html&gt;';

        app.htmlSourceContent.innerHTML =
            '<span class=fullText id=full1>' + textBefore.join('') + '</span>' +
            text +
            '<span class=fullText id=full2>' + textAfter + '</span>';
    } else {
        domFull1 = document.getElementById('full1');
        domFull2 = document.getElementById('full2');

        if (domFull1) {
            domFull1.remove();
        }
        if (domFull2) {
            domFull2.remove();
        }
    }
}

function generateHTML() {
    'use strict';
    var
        nodes = app.htmlPreview.childNodes,
        node,
        block,
        prefix = app.htmlOptsPrefix.value,
        article = document.createElement('article'),
        articleText,
        i, j, nbNotes, nb,
        notes, note, numNote = 0, tabNotes = [], footer,
        noteInfo, noteInfoA;

    if (prefix) {
        prefix = prefix.trim().replace(/[\s]/g, '');
    }

    // chaque bloc du DOM permet d'en créer un nouveau (avec les bons attributs) pour l'insèrer dans un tableau
    nb = nodes.length;
    
    //for (node of nodes) { //ES6
    for (i = 0; i < nb; i++) {
        node = nodes[i];
        block = document.createElement(node.tagName);
        block.innerHTML = node.innerHTML;
        if (node.classList && node.classList.contains('poem')) {
            block.className = 'poem';
        }
        if (prefix !== '') block.id = prefix + node.id;
        article.appendChild(block);
    }

    // footnotes in blocks
    for (i = 0; i < nb; i++) {
        block = article.childNodes.item(i);
        notes = block.querySelectorAll('[data-cite]');
        for (j = 0, nbNotes = notes.length; j < nbNotes; j++) {
            numNote++;
            note = notes[j];
            if (prefix) {
                note.id = prefix + 'note_' + numNote;
                note.href = '#' + prefix + 'footnote_' + numNote;
            } else {
                note.id = 'note_' + numNote;
                note.href = '#footnote_' + numNote;
            }

            note.textContent = numNote;
            note.removeAttribute('data-cite');
            tabNotes.push(note);
        }
    }

    // footnotes in bottom div
    if (numNote > 0) {
        footer = document.createElement('footer');
        for (i = 0; i < numNote; i++) {
            note = tabNotes[i];
            noteInfo = document.createElement('p');
            noteInfoA = document.createElement('a');
            if (prefix) {
                noteInfoA.id = prefix + 'footnote_' + (i + 1);
                noteInfoA.href = '#' + prefix + 'note_' + (i + 1);
            } else {
                noteInfoA.id = 'footnote_' + (i + 1);
                noteInfoA.href = '#note_' + (i + 1);
            }
            noteInfoA.innerHTML = i + 1;
            noteInfo.appendChild(noteInfoA);
            noteInfo.innerHTML += ' - ' + note.title;
            footer.appendChild(noteInfo);
        }
    }

    app.htmlSourceContent.textContent = article.outerHTML;
    if (footer) {
        app.htmlSourceContent.textContent += footer.outerHTML;
    }

    generateFull(app.htmlOptsFull);
}

function generateSource() {
    'use strict';
    var
        uuid = app.currentDoc,
        doc,
        title = localStorage.getItem(uuid + '.title'),
        author = localStorage.getItem(uuid + '.author'),
        blocks = JSON.parse(localStorage.getItem(uuid + '.blocks'));
    
    blocks = blocks.map(function (blk) {
        return {id: blk.id, content: blk.content};
    });
    
    doc = {
        uuid: uuid,
        name: localStorage.getItem(uuid + '.name'),
        blocks: blocks
    };
    if (title) {
        doc.title = title;
    }
    if (author) {
        doc.author = author;
    }

    return JSON.stringify(doc);
}

function addDoc(e) {
    'use strict';
    var uuids, uuid, names = [], name = app.inputDocName.value.trim();
    
    if (name !== '') {
        uuids = JSON.parse(localStorage.getItem('docs'));
        
        for (uuid of uuids) {
            names.push(localStorage.getItem(uuid + '.name'));
        }
        
        if (names.indexOf(name) === -1) {
            setDoc({
                blocks: [
                    {
                        content: name + ' : Start here.',
                        id: 1
                    }
                ],
                name: name,
                uuid: generateUUID()
            });
        
            app.btCompose.click();
        
        } else {
            alert('"' + name + '" is already used.');
        }
    }
}

function addDocImported(data) {
    'use strict';
    var block;
    
    function namer(data) { //problème dans cette fonction
        var
            docs = JSON.parse(localStorage.getItem('docs')),
            doc;
        
        docs = docs.map(function (uuid){
           return {uuid: uuid, name: localStorage.getItem(uuid + '.name')};
        });
        
        for (doc of docs) {
            if (doc.name === data.name) {
                data.name = 'copie de ' + data.name;
            }
            if (doc.uuid === docs[docs.length - 1].uuid) {
                return;
            }
        }
        namer(data);
    }

    if (data.uuid && data.name && data.blocks) {
        //check blocks part
        for (block of data.blocks) {
            if (!block.id || !block.content) {
                alert('Fichier erroné (clef "blocks" incorrecte)');
                return;
            }
        }
        
        namer(data);
        
        setDoc(data);
        app.btCompose.click();
        
    } else {
        alert('Fichier erroné');
    }
}

function caretNodes() {
    // get block node of caret position or block nodes if caret is selection
    // based on http://stackoverflow.com/q/4913940
    'use strict';
    var sel, nodeDeb, nodeEnd, idDeb, idEnd, idTemp, el, nodes = [], uuid, blocks, i, nb;

    sel = window.getSelection();
    
    if (!sel.anchorNode) {
        return [];
    }
    
    nodeDeb = sel.anchorNode.parentNode;
    nodeEnd = sel.focusNode.parentNode;
    
    if (nodeDeb.id === app.compose.id) {
        nodeDeb = sel.anchorNode;
        nodeEnd = sel.focusNode;
    }
    
    while (nodeDeb.nodeType !== 1 || nodeDeb.nodeName === 'SPAN') {
        nodeDeb = nodeDeb.parentNode;
    }
    while (nodeEnd.nodeType !== 1 || nodeEnd.nodeName === 'SPAN') {
        nodeEnd = nodeEnd.parentNode;
    }

    if (nodeDeb === nodeEnd) {
        return [nodeDeb];
    }
    
    
    uuid = app.currentDoc;
    blocks = JSON.parse(localStorage.getItem(uuid + '.blocks'));
    blocks = blocks.map(function (block) {
        return block.id;
    });
    
    idDeb = parseInt(nodeDeb.id);
    idEnd = parseInt(nodeEnd.id);
    
    if (blocks.indexOf(idDeb) > blocks.indexOf(idEnd)) {
        // inverse idDeb & idEnd
        idTemp = idDeb;
        idDeb = idEnd;
        idEnd = idTemp;
    }
    
    for (i = 0, nb = blocks.length; i < nb; i++) {
        el = parseInt(blocks[i]);
        if (el === idDeb) {
            nodes.push(document.getElementById(el));
            i++;
            for (i; i < nb; i++) {
                el = parseInt(blocks[i]);
                nodes.push(document.getElementById(el));
                if (el === idEnd) {
                    break;
                }
            }
            break;
        }
    }
    return nodes;
}

function caretInfos(block) {
    'use strict';
    var start, end, isEnd, selRange, testRange, sel;

    sel = window.getSelection();
    selRange = sel.getRangeAt(0);
    testRange = selRange.cloneRange();

    testRange.selectNodeContents(block);
    testRange.setEnd(selRange.startContainer, selRange.startOffset);
    start = testRange.toString().length;

    testRange.selectNodeContents(block);
    testRange.setEnd(selRange.endContainer, selRange.endOffset);
    end = testRange.toString().length;

    testRange.selectNodeContents(block);
    testRange.setStart(selRange.endContainer, selRange.endOffset);
    isEnd = (testRange.toString() === "");

    return {start: start || 0, end: end || 0, isEnd: isEnd};
}

function setCaret(block, caret) {
    'use strict';
    var
        range = document.createRange(),
        sel,
        node = block.firstChild;

    range.setStart(node, caret.start);
    if (node.length < caret.end) {
        caret.end = node.length;
    } else {
        range.setEnd(node, caret.end);
    }

    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
} // unused

function caretMoved(noNodes) {
    'use strict';

    var nodes, node, oldNode, nbBlocks, domBlocks = [], blocks = [], startNode;

    if (noNodes) {
        nodes = [];
    } else {
        nodes = caretNodes();
    }
    
    for (oldNode of app.currentBlock) {
        if (oldNode.textContent.trim() === '' && nodes.indexOf(oldNode) === -1) {
            //supprime le noeud vide qui ne fait pas partie des nouveaux noeuds courant
            oldNode.remove();
        }
    }
    
    //set blocks in LS
    domBlocks = app.compose.childNodes;
    for (var i = 0, nb = domBlocks.length; i < nb; i++) {
        blocks.push({content: domBlocks[i].innerHTML, id: domBlocks[i].id});
    }

    localStorage.setItem(app.currentDoc + '.blocks', JSON.stringify(blocks));
    console.log('push in LS : blocks');
    
    nbBlocks = JSON.parse(localStorage.getItem(app.currentDoc + '.blocks')).length;
    
    if (nbBlocks === 0) {
        startNode = document.createElement('p');
        startNode.textContent = "Start here.";
        startNode.title = "#1";
        startNode.id = 1;
        app.compose.appendChild(startNode);
        localStorage.setItem(app.currentDoc + '.blocks', JSON.stringify([{
            content: "Start here.",
            id: 1
        }]));
        console.log('push in LS : blocks');
        localStorage.setItem(app.currentDoc + '.idMax', 1);
    }

    app.currentBlock = nodes;
    console.log(app.currentBlock);
}

function saveTextAsFile() {
    'use strict';
    // grab the content of the form field and place it into a variable
    var textToWrite = app.sourceContent.textContent;
    //  create a new Blob (html5 magic) that contains the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], {type:'application/json'});
    // Specify the name of the file to be saved
    var fileNameToSaveAs = localStorage.getItem(app.currentDoc + '.name') + '.tale';

    // Optionally allow the user to choose a file name by providing 
    // an imput field in the HTML and using the collected data here
    // var fileNameToSaveAs = txtFileName.text;

    // create a link for our script to 'click'
    var downloadLink = document.createElement("a");
    //  supply the name of the file (from the var above).
    // you could create the name here but using a var
    // allows more flexability later.
    downloadLink.download = fileNameToSaveAs;
    // provide text for the link. This will be hidden so you
    // can actually use anything you want.
    downloadLink.innerHTML = "My Hidden Link";

    // allow our code to work in webkit & Gecko based browsers
    // without the need for a if / else block.
    window.URL = window.URL || window.webkitURL;

    // Create the link Object.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    // when link is clicked call a function to remove it from
    // the DOM in case user wants to save a second file.
    downloadLink.onclick = destroyClickedElement;
    // make sure the link is hidden.
    downloadLink.style.display = "none";
    // add the link to the DOM
    document.body.appendChild(downloadLink);

    // click the new link
    downloadLink.click();
}

function saveTextAsOdt() {
    'use strict';
    // grab the content of the form field and place it into a variable
    var textToWrite = getfOdt();
    //  create a new Blob (html5 magic) that contains the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], {type:'text/xml'});
    // Specify the name of the file to be saved
    var fileNameToSaveAs = localStorage.getItem(app.currentDoc + '.name') + '.fodt';

    // Optionally allow the user to choose a file name by providing 
    // an imput field in the HTML and using the collected data here
    // var fileNameToSaveAs = txtFileName.text;

    // create a link for our script to 'click'
    var downloadLink = document.createElement("a");
    //  supply the name of the file (from the var above).
    // you could create the name here but using a var
    // allows more flexability later.
    downloadLink.download = fileNameToSaveAs;
    // provide text for the link. This will be hidden so you
    // can actually use anything you want.
    downloadLink.innerHTML = "My Hidden Link";

    // allow our code to work in webkit & Gecko based browsers
    // without the need for a if / else block.
    window.URL = window.URL || window.webkitURL;

    // Create the link Object.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    // when link is clicked call a function to remove it from
    // the DOM in case user wants to save a second file.
    downloadLink.onclick = destroyClickedElement;
    // make sure the link is hidden.
    downloadLink.style.display = "none";
    // add the link to the DOM
    document.body.appendChild(downloadLink);

    // click the new link
    downloadLink.click();
}

function destroyClickedElement(event) {
    'use strict';
    // remove the link from the DOM
    document.body.removeChild(event.target);
}

function handleFiles() {
    'use strict';
    var
        fileList = this.files,
        file = fileList[0],
        reader = new FileReader(),
        data;
    
    reader.onload = function(e) {
        data = reader.result;
        function isJsonString(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }
        if (isJsonString(data)) {
            addDocImported(JSON.parse(data));
        } else {
            alert("Ce fichier est invalide.");
        }
    };
    reader.readAsText(file);
}

/* discoverDoc */

var discoverDoc = {
    blocks: [
        {
            id: 1,
            content: "= Bienvenue sur Mountale"
        },
        {
            id: 2,
            content: "Mountale permet d'écrire du texte de façon simple et d'en récupérer le HTML pour l'insérer, par exemple, sur un blog. Ce document permet de faire un tour rapide du fonctionnement de l'application."
        },
        {
            id: 3,
            content: "== Interface"
        },
        {
            id: 4,
            content: "En haut de page se trouve le nom de l'application \"Mountale\", accompagné d'un numéro de version. Tant que la version est inférieure à 1.0, c'est que Mountale est en version beta. Juste à gauche se trouve deux icônes. La première permet d'accéder au code source (car Mountale est entièrement open source) et la seconde permet d'accéder à une documentation plus complète que celle de ce document."
        },
        {
            id: 5,
            content: "Un menu se tient juste sous le nom de l'application. Il permet d'accéder à la gestion des documents (Files), à l'enregistrement du fichier (Source), à l'aperçu en HTML (HTML), etc."
        },
        {
            id: 6,
            content: "Sous ce menu se trouve la section dans laquelle nous sommes, aintion \"Composer\", il est possible de modifier ce texte en cliquant dessus. Un curseur apparaît. Essaye :)"
        },
        {
            id: 7,
            content: "== Enregistrement du document"
        },
        {
            id: 8,
            content: "La sauvegarde se fait automatiquement dans le navigateur même (localStorage pour les connaisseurs). Il reste donc en mémoire dans le cache du navigateur et ne peut donc être visible que par son créateur. Si le cache est vidé, alors tous les documents créés seront supprimés. C'est pourquoi à partir du menu, >SOURCE permet d'enregistrer le document en .tale sur son ordinateur (ou tablette, ou smartphone). Dans >FILES, il sera importable afin de pouvoir s'en servir à nouveau."
        },
        {
            id: 10,
            content: "== Langage du Composer"
        },
        {
            id: 11,
            content: "On peut remarquer que des \"=\" se trouvent devant les titres et que les paragraphes s'écrivent sans symboles particuliers. Il y a un marquage spécial pour chaque type de bloc de texte et un autre pour le texte lui-même. Nous allons tout voir dans la suite."
        },
        {
            id: 12,
            content: "=== Titre"
        },
        {
            id: 13,
            content: "Le titre commence par un à six symboles \"=\". Le nombre dépend du niveau et on commence par le niveau 1."
        },
        {
            id: 14,
            content: "=== Paragraphe"
        },
        {
            id: 15,
            content: "Il ne contient aucun symbole particulier étant donné que c'est le type de bloc qui est le plus utilisé."
        },
        {
            id: 16,
            content: "=== Dialogue"
        },
        {
            id: 17,
            content: "Chaque réplique s'introduit par un symbole \"-\" (moins). Comme ceci :"
        },
        {
            id: 18,
            content: "- Salut Jack !<br>- Yo John."
        },
        {
            id: 19,
            content: "On peut remarquer qu'entre les deux répliques il n'y a pas de saut de ligne. Pour ce faire, en fin de réplique, il faut appuyer simultanément sur Shift (ou Maj) + Entrée."
        },
        {
            id: 20,
            content: "=== Pause"
        },
        {
            id: 21,
            content: "Marquer la séparation entre deux blocs de texte se fait avec \"---\" (trois signes moins), comme ceci :"
        },
        {
            id: 22,
            content: "---"
        },
        {
            id: 23,
            content: "=== Liste"
        },
        {
            id: 24,
            content: "Chaque élément de liste s'introduit par \"*\" (étoile ou astérisque). Selon le niveau d'imbrication d'une liste, il y aura une ou plusieurs étoiles. Placer un \"1\" devant une étoile permet de changer les éléments du même niveau de liste en liste ordonnée. Enfin, pour le moment, il n'est possible d'imbriquer les listes que sur un niveau. Voici une liste simple :"
        },
        {
            id: 25,
            content: "* Macaque<br>* Orang-outang<br>* Banane"
        },
        {
            id: 26,
            content: "Et plus complexe :"
        },
        {
            id: 27,
            content: "* Légumes<br>1** Carottes<br>** Choux<br>** Salades<br>* Fruits<br>1** Pommes<br>** Coings"
        },
        {
            id: 28,
            content: "=== Tableau"
        },
        {
            id: 29,
            content: "Il se présente sous cette forme :"
        },
        {
            id: 30,
            content: "!! Titre 1    !! Titre 2    !!<br>|| Élément a  || 50         ||<br>|| Élément b  || 40,5       ||<br>|| Élément c  || inconnu    ||<br>|| Élément d  || 48,3       ||"
        },
        {
            id: 36,
            content: "=== Figure"
        },
        {
            id: 37,
            content: "La figure début par \"!\", suivi d'une légende. À la ligne se trouve une ou plusieurs images. Comme ceci :"
        },
        {
            id: 38,
            content: "! Ceci est une légende<br>{{texte alternatif|core/writer.jpg}}"
        },
        {
            id: 31,
            content: "=== Citation"
        },
        {
            id: 32,
            content: "La citation débute par \">\" et se termine par \"<\". La première ligne contient la source de la citation et les suivantes, son contenu (qui peut-être de n'importe quel type de bloc). Voici un exemple de citation simple :"
        },
        {
            id: 33,
            content: "> Jack<br>Le vent m'appelle.<br><"
        },
        {
            id: 34,
            content: "Et une citation qui contient, dans l'ordre, un titre, un paragraphe, une citation simple et un dernier paragraphe :"
        },
        {
            id: 35,
            content: "> Journal<br>= Ceci est un titre<br>Ceci est un paragraphe.<br>> Jack<br>Le vent m'appelle.<br><<br>Ceci est un dernier paragraphe.<br><"
        },
        {
            id: 39,
            content: "=== Texte"
        },
        {
            id: 40,
            content: "{{alt|l|core/writer.jpg}}À l'intérieur du texte de chaque bloc peuvent être insérées des marques permettant d'obtenir des images, du **gras**, de l'''italique'', des [[liens|http://test.com]], des notes de bas de pages((Ceci est le contenu de la note)), du texte ||surligné||, du texte __souligné__ et du ``code``."
        },
        {
            id: 41,
            content: "== Mots de la fin"
        },
        {
            id: 42,
            content: "Une documentation détaillée est disponible sur Github [[ici|https://github.com/svenseitan/svenseitan.github.io/blob/master/README.md]]. Le projet est en constante évolution. Pour celles et ceux qui ont à faire bien trop souvent au syndrôme de la page blanche, n'ayez crainte, celle-ci est grise ! Bonne écriture."
        },
    ],    
    name: "Découverte (fr)",
    title: "Découverte de Mountale",
    author: "Sven Seitan",
    uuid: generateUUID()
};

/* convert system */

var convert = {
    toHTML: function (block) {
        'use strict';
        var content, firstChar;
        block.innerHTML = convert.toJSON(block.innerHTML);
        content = block.innerHTML;
        firstChar = content.substring(0, 1);

        function to_html(pbml) {
            //cette fonction convertit uniquement une seule ligne de contenu lors de son appel en HTML (inline). Le contenu est tout sauf le marquage de type bloc.

            //utile uniquement pour le développement
            if (typeof pbml !== 'string') {
                console.error("Signature de la fonction to_html incorrecte : Chaine requise et pas ça :");
                console.log(pbml);
                return '<mark>error</mark>';
            }

            var ml, marker, regexLink, array, str, opts, opt, a, i, nb, regexImg, img, thisCase;

            //echap note, link, image (in order)
            ml = pbml.replace(/\\\(\((.*?)\)\)/g, '&lpar;&lpar;$1&rpar;&rpar;');
            ml = ml.replace(/\\\[\[(.*?)\]\]/g, '&lsqb;&lsqb;$1&rsqb;&rsqb;');
            ml = ml.replace(/\\\{\{(.*?)\}\}/g, '&lcub;&lcub;$1&rcub;&rcub;');

            //echap double tags
            app.MARKERS.map(function (el) {
                marker = new RegExp('\\\\\\' + el.mark + '\\' + el.mark + '(.*?)\\\\\\' + el.mark + '\\' + el.mark, 'g');
                ml = ml.replace(marker, el.entity + el.entity + '$1' + el.entity + el.entity);
            });

            // note
            ml = ml.replace(/\(\((.*?)\)\)/ig, '<sup><a href="#" id="note_0" data-cite="$1" title="$1">*</a></sup>');

            // link
            if (/\[\[(.*?)\]\]/g.test(ml)) {
                regexLink = new RegExp('\\[\\[(.*?)\\]\\]', 'g');
                while ((array = regexLink.exec(ml)) !== null) {
                    str = array[0];
                    opts = str.substring(2, str.length - 2).split('|');
                    a = document.createElement("a");

                    for (i = 0, nb = opts.length; i < nb; i++) {
                        opt = opts[i].trim();
                        if (i === nb - 1) { //last opt is link, always.
                            a.href = opt;
                            if (a.textContent === '') {
                                a.textContent = opt;
                            }
                        } else if (opt === 'b') {
                            a.target = '_blank';
                        } else if (opt === 'nf') {
                            a.rel = 'nofollow';
                        } else {
                            a.textContent = opt;
                        }
                    }
                    ml = ml.replace(/\[\[(.*?)\]\]/, a.outerHTML);
                }
            }

            // br (only in paragraphs)
            ml = ml.replace(/\/\/\//ig, '<br>');

            // image
            if (/{{(.*?)}}/g.test(ml)) {
                regexImg = new RegExp('{{(.*?)}}', 'g');
                while ((array = regexImg.exec(ml)) !== null) {
                    str = array[0];
                    opts = str.substring(2, str.length - 2).split('|');
                    img = document.createElement("img");
                    thisCase = 0;

                    for (i = 0, nb = opts.length; i < nb; i++) {
                        opt = opts[i].trim();
                        if (i === nb - 1) { //last opt is link, always.
                            img.src = opt;
                        } else if (['l', 'r', '25', '33', '50', '75', '100'].indexOf(opt) !== -1) {
                            if (['l', 'r'].indexOf(opt) !== -1) {
                                img.classList.add(opt === 'l' ? 'imgLeft' : 'imgRight');
                            }
                            if (['25', '33', '50', '75', '100'].indexOf(opt) !== -1) {
                                img.style.width = opt + '%';
                            }
                        } else if (opt !== '') {
                            if (thisCase === 0) {
                                /*thisCase permet de savoir si c'est la première ou la seconde
                                fois qu'une chaine se présente. 1ère fois = alt, 2nde = legend*/
                                img.alt = opt;
                                thisCase++;
                            } else {
                                //title
                                img.title = opt;
                                thisCase = 0;
                            }

                        }
                    }
                    ml = ml.replace(/{{(.*?)}}/, img.outerHTML);
                }
            }

            // double tags
            app.MARKERS.map(function (el) {
                marker = new RegExp('\\' + el.mark + '\\' + el.mark + '\\s*(.*?)\\s*' + '\\' + el.mark + '\\' + el.mark, 'g');
                ml = ml.replace(marker, '<' + el.html + '>$1</' + el.html + '>');
            });

            /* before / ponctuation(s) / after
                espace fine insécable : &nnbsp;
                espace mots insécable : &nbsp;

                - / .,]) / espace
                &nnbsp; / ;!? / espace
                &nbsp; / :» / espace
                espace / « / &nbsp;
                espace / ([ / -
            */

            //ml = ml.replace(/\s([;!?]){1}/g, '&#8239;$1'); //vrai espace fine insécable
            ml = ml.replace(/\s([;!?]){1}/g, '<span style="font-size: 0.67em">&nbsp;</span>$1'); //fausse espace fine insécable, mais compatible partout. La vrai espace fine insécable ne veut pas fonctionner lors de l'export HTML actuel.

            ml = ml.replace(/\s([:»%]){1}/g, '&nbsp;$1');
            ml = ml.replace(/\s(«){1}\s*/g, ' $1&nbsp;');

            //voir pour les demi cadratin
            ml = ml.trim();


            ml = ml.replace(/\\~~(.*?)\\~~/g, '&#126;&#126;$1&#126;&#126;');
            ml = ml.replace(/~~(.*?)~~/g, '$1');
            ml = ml.replace(/&#126;&#126;(.*?)&#126;&#126;/g, '~~$1~~');


            if (/<br>/.test(ml)) {
                return {poem: true, data: ml};
            } else {
                return ml;
            }
        }

        function to_paragraph(block) {
            var node = document.createElement('p'), inline;
            if (block.innerHTML) {
                node.id = block.id;
                inline = to_html(block.innerHTML);
                if (typeof inline !== 'string') {
                    node.innerHTML = inline.data;
                    node.className = 'poem';
                } else {
                    node.innerHTML = inline;
                }
            } else {
                inline = to_html(block);
                if (typeof inline !== 'string') {
                    node.innerHTML = inline.data;
                    node.className = 'poem';
                } else {
                    node.innerHTML = inline;
                }
            }
            
            return node;
        }

        function to_title(block) {
            var content, node, level = 0, i;
            
            if (block.innerHTML) {
                content = block.innerHTML;
            } else {
                content = block;
            }
            
            for (i = 0; content[i] === '='; i++) {
                level ++;
            }
            node = document.createElement('h' + level);
            if (block.innerHTML) {
                node.innerHTML = to_html(content.substring(level + 1));
                node.id = block.id;
            } else {
                node.innerHTML = to_html(block.substring(level + 1));
            }
            return node;
        }

        function to_discuss(block) {
            var
                node = document.createElement('div'),
                content, items, nb, classname, items2 = [];
            
            if (block.innerHTML) {
                content = block.innerHTML;
                node.id = block.id;
            } else {
                content = block;
            }
            
            items = content.split('<br>');
            nb = items.length;
            
            items.map(function (item, i) {
                if (i === 0) {
                    classname = 'alpha';
                } else {
                    classname = i != nb - 1 ? 'inter' : 'omega';
                }
                content = to_html(item).replace(/^-\s/, '—&ensp;');
                items2.push('<p class=disc_' + classname + '>' + content + '</p>');
            });

            node.innerHTML = items2.join('');
            return node;
        }

        function to_line(block) {
            var node = document.createElement('hr');
            if (typeof block !== 'string') {
                node.id = block.id;
            }
            return node;
        }

        function to_list(block) {
            /*
                item : un élément de liste provenant du json
                child : un groupe d'enfants ou un enfant
            */
            var
                node, content, items, item,
                childs = [], group = [], infos, type = '';
            
            if (block.innerHTML) {
                content = block.innerHTML;
            } else {
                content = block;
            }
            
            items = content.split('<br>');

            function itemInfos(item) { //donne type, level et name d'un item
                var
                    type = item.substring(0, 1) === '*' ? 'ul' : 'ol',
                    level = 0,
                    j = type === 'ul' ? 0 : 1,
                    name = '';

                for (j; item[j] !== ' ' && item[j] !== undefined; j++) {
                    level++;
                }

                name = item.substring(level + (type === 'ul' ? 1 : 2));

                return {
                    type: type,
                    level: level,
                    name: to_html(name)
                };

            }

            for (item of items) {
                infos = itemInfos(item);
                if (infos.level === 2) {
                    group.push('<li>' + infos.name + '</li>');
                    if (type === '') {
                        type = infos.type;
                    }
                } else {
                    if (group.length > 0) {
                        childs.push('<' + type + '>' + group.join('') + '</' + type + '>');
                        group = [];
                        type = '';
                    }
                    childs.push('<li>' + infos.name + '</li>');
                }
            }
            if (group.length > 0) {
                childs.push('<' + type + '>' + group.join('') + '</' + type + '>');
                group = []; type = '';//pas nécessaire ici
            }

            node = document.createElement(content.substring(0, 1) === '*' ? 'ul' : 'ol');
            node.innerHTML = childs.join('');
            
            if (block.innerHTML) {
                node.id = block.id;
            }
            
            return node;
        }

        function to_figure(block) {
            var
                node = document.createElement('figure'),
                content, lines, legend, medias;
            
            if (block.innerHTML) {
                content = block.innerHTML;
                node.id = block.id;
            } else {
                content = block;
            }
            
            lines = content.split('<br>');
            legend = lines[0].substring(2);
            medias = lines[1];

            node.innerHTML = to_html(medias) + (legend ? '<figcaption>' + to_html(legend) + '</figcaption>' : '');
            
            return node;
        }
        
        function to_table(block) {
            var
                node = document.createElement('table'),
                tr, tt, thOrTd, elts,
                content, lines, line, nb, nb1, i, j, legend, medias;
            
            if (block.innerHTML) {
                content = block.innerHTML;
                node.id = block.id;
            } else {
                content = block;
            }
            
            lines = content.split('<br>');
            nb = lines.length;
            
            for (i = 0; i < nb; i++) {
                line = lines[i];
                tr = document.createElement('tr');
                
                if (/^!!\s/.test(line)) {
                    elts = line.split('!!');
                    thOrTd = 'th';
                } else {
                    elts = line.split('||');
                    thOrTd = 'td';
                }
                
                elts = elts.filter(function(n){ return n != "" });
                nb1 = elts.length;
                console.log(elts);
                for (j = 0; j < nb1; j++) {
                    tt = document.createElement(thOrTd);
                    tt.innerHTML = to_html(elts[j].trim());
                    tr.appendChild(tt);
                }

                node.appendChild(tr);
                
            }
            
            return node;
        }

        function to_cite(block) {
            var
                node = document.createElement('blockquote'),
                lines, line, firstChar, linesGrouped = [], lines2 = [], c = [], i, j, el, source, firstChar2, sc, nb;

            if (block.innerHTML) {
                content = block.innerHTML;
                node.id = block.id;
            } else {
                content = block;
            }
            
            lines = content.split('<br>');

            for (i = 0, nb = lines.length; i < nb; i++) {
                if (/^1?\*+\s/.test(lines[i])) { // list
                    for (j = i; /^1?\*+\s/.test(lines[j]); j++) {
                        linesGrouped.push(lines[j]);
                        i++;
                    }
                    lines2.push(linesGrouped.join('<br>'));
                    linesGrouped = [];
                    i--;
                } else if (/^-\s/.test(lines[i])) { // discuss
                    for (j = i; /^-\s/.test(lines[j]); j++) {
                        linesGrouped.push(lines[j]);
                        i++;
                    }
                    lines2.push(linesGrouped.join('<br>'));
                    linesGrouped = [];
                    i--;
                } else if (/^&gt;/g.test(lines[i]) && i !== 0) { //cite
                    j = i;
                    sc = 0;
                    do {
                        firstChar2 = lines[j].substring(0, 4);
                        linesGrouped.push(lines[j]);
                        if (firstChar2 === '&gt;') {
                            sc++;
                        } else if (firstChar2 === '&lt;') {
                            sc--;
                        }
                        j++;
                        i++;
                    } while (sc > 0 && j < nb);
                    lines2.push(linesGrouped.join('<br>'));
                    linesGrouped = [];
                    i--;
                } else if (/^!\s/.test(lines[i])) { // figure                    
                    linesGrouped.push(lines[i], lines[i+1]);
                    lines2.push(linesGrouped.join('<br>'));
                    linesGrouped = [];
                    i++;
                } else {
                    lines2.push(lines[i]);
                }
            }
            
            for (i = 0, nb = lines2.length; i < nb; i++) {
                line = lines2[i];
                firstChar = line.substring(0, 1);

                switch (true) {
                    case /[A-Za-z]/.test(firstChar): c.push(to_paragraph(line)); break;
                    case line === '---': c.push(to_line(line)); break;
                    case firstChar === '-': c.push(to_discuss(line)); break;
                    case firstChar === '=': c.push(to_title(line)); break;
                    case /^&gt;\s/.test(line):
                        if (i === 0) {
                            source = line.substring(5);
                        } else {
                            c.push(to_cite(line));
                        }
                        break;
                    case firstChar === '!': c.push(to_figure(line)); break;
                    case /^1?\*{1}\s/.test(line): c.push(to_list(line)); break;
                    case /^&lt;/.test(line): break;
                    default: c.push(to_paragraph(line));
                }
            }

            var elts = [];
            for (el of c) {
                if (el.classList && el.classList.contains('poem')) {
                    elts.push('<' + el.tagName + ' class=poem>' + el.innerHTML + '</' + el.tagName + '>');
                } else {
                    elts.push('<' + el.tagName + '>' + el.innerHTML + '</' + el.tagName + '>');
                }
            }
            if (source) {
                elts.push('<footer>' + source + '</footer>');
            }

            node.innerHTML = elts.join('');
            return node;
        }

        switch (true) {
            case /[A-Za-z]/.test(firstChar): return to_paragraph(block);
            case content === '---': return to_line(block);
            case firstChar === '-': return to_discuss(block);
            case firstChar === '=': return to_title(block);
            case /^&gt;\s/.test(content): return to_cite(block);
            case /^[!|]{2}\s/.test(content): return to_table(block);
            case firstChar === '!': return to_figure(block);
            case /^1?\*{1}\s/.test(content): return to_list(block);
            default: return to_paragraph(block);
        }
    },
    toFODT: function (nodeLS) { //Object {content: "---", id: "9"}
        var content, firstChar;
        content = convert.toJSON(nodeLS.content);
        firstChar = content.substring(0, 1);
        
        function to_fodt(pbml) {
            //cette fonction convertit uniquement une seule ligne de contenu lors de son appel en HTML (inline). Le contenu est tout sauf le marquage de type bloc.

            //utile uniquement pour le développement
            if (typeof pbml !== 'string') {
                console.error("Signature de la fonction to_fodt incorrecte : Chaine requise et pas ça :");
                console.log(pbml);
                return '<mark>error</mark>';
            }

            var ml, marker, regexLink, array, str, opts, opt, a, i, nb, regexImg, img, thisCase;

            //echap note, link, image (in order)
            ml = pbml.replace(/\\\(\((.*?)\)\)/g, '&lpar;&lpar;$1&rpar;&rpar;');
            ml = ml.replace(/\\\[\[(.*?)\]\]/g, '&lsqb;&lsqb;$1&rsqb;&rsqb;');
            ml = ml.replace(/\\\{\{(.*?)\}\}/g, '&lcub;&lcub;$1&rcub;&rcub;');

            //echap double tags
            app.MARKERS.map(function (el) {
                marker = new RegExp('\\\\\\' + el.mark + '\\' + el.mark + '(.*?)\\\\\\' + el.mark + '\\' + el.mark, 'g');
                ml = ml.replace(marker, el.entity + el.entity + '$1' + el.entity + el.entity);
            });

            // note
            ml = ml.replace(/\(\((.*?)\)\)/ig, '<text:note><text:note-body><text:p>$1</text:p></text:note-body></text:note>');
            //superscript
            ml = ml.replace(/\^\^(.*?)\^\^/g, '<text:span text:style-name="Mountale.superscript">$1</text:span>');
            //subscript
            ml = ml.replace(/\,\,(.*?)\,\,/g, '<text:span text:style-name="Mountale.subscript">$1</text:span>');
            //underline
            ml = ml.replace(/\_\_(.*?)\_\_/g, '<text:span text:style-name="Mountale.underline">$1</text:span>');
            //highlight
            ml = ml.replace(/\|\|(.*?)\|\|/g, '<text:span text:style-name="Mountale.highlight">$1</text:span>');

            // link (à faire car celui ci est celui du html)
            if (/\[\[(.*?)\]\]/g.test(ml)) {
                regexLink = new RegExp('\\[\\[(.*?)\\]\\]', 'g');
                while ((array = regexLink.exec(ml)) !== null) {
                    str = array[0];
                    opts = str.substring(2, str.length - 2).split('|');
                    a = document.createElement("a");

                    for (i = 0, nb = opts.length; i < nb; i++) {
                        opt = opts[i].trim();
                        if (i === nb - 1) { //last opt is link, always.
                            a.href = opt;
                            if (a.textContent === '') {
                                a.textContent = opt;
                            }
                        } else if (opt === 'b') {
                            a.target = '_blank';
                        } else if (opt === 'nf') {
                            a.rel = 'nofollow';
                        } else {
                            a.textContent = opt;
                        }
                    }
                    ml = ml.replace(/\[\[(.*?)\]\]/, a.outerHTML);
                }
            }

            // br (only in paragraphs)
            ml = ml.replace(/\/\/\//ig, '<br/>');

            // image (à faire car celui ci est celui du html)
            if (/{{(.*?)}}/g.test(ml)) {
                regexImg = new RegExp('{{(.*?)}}', 'g');
                while ((array = regexImg.exec(ml)) !== null) {
                    str = array[0];
                    opts = str.substring(2, str.length - 2).split('|');
                    img = document.createElement("img");
                    thisCase = 0;

                    for (i = 0, nb = opts.length; i < nb; i++) {
                        opt = opts[i].trim();
                        if (i === nb - 1) { //last opt is link, always.
                            img.src = opt;
                        } else if (['l', 'r', '25', '33', '50', '75', '100'].indexOf(opt) !== -1) {
                            if (['l', 'r'].indexOf(opt) !== -1) {
                                img.classList.add(opt === 'l' ? 'imgLeft' : 'imgRight');
                            }
                            if (['25', '33', '50', '75', '100'].indexOf(opt) !== -1) {
                                img.style.width = opt + '%';
                            }
                        } else if (opt !== '') {
                            if (thisCase === 0) {
                                /*thisCase permet de savoir si c'est la première ou la seconde
                                fois qu'une chaine se présente. 1ère fois = alt, 2nde = legend*/
                                img.alt = opt;
                                thisCase++;
                            } else {
                                //title
                                img.title = opt;
                                thisCase = 0;
                            }

                        }
                    }
                    ml = ml.replace(/{{(.*?)}}/, img.outerHTML);
                }
            }

            // double tags
            app.MARKERS.map(function (el) {
                marker = new RegExp('\\' + el.mark + '\\' + el.mark + '\\s*(.*?)\\s*' + '\\' + el.mark + '\\' + el.mark, 'g');
                ml = ml.replace(marker, '<' + el.html + '>$1</' + el.html + '>');
            });

            ml = ml.replace(/\s([;!?]){1}/g, ' $1');
            ml = ml.replace(/\s([:»%]){1}/g, ' $1');
            ml = ml.replace(/\s(«){1}\s*/g, ' $1 ');

            //voir pour les demi cadratin
            ml = ml.trim();


            ml = ml.replace(/\\~~(.*?)\\~~/g, '&#126;&#126;$1&#126;&#126;');
            ml = ml.replace(/~~(.*?)~~/g, '$1');
            ml = ml.replace(/&#126;&#126;(.*?)&#126;&#126;/g, '~~$1~~');

            //modification du em et du strong (patch a to_JSON pour to_FODT)
            ml = ml.replace(
                /<em>(.*?)<\/em>/g,
                '<text:span text:style-name="Mountale.italic">$1</text:span>'
            );
            ml = ml.replace(
                /<strong>(.*?)<\/strong>/g,
                '<text:span text:style-name="Mountale.bold">$1</text:span>'
            );

            if (/<br\/>/.test(ml)) {
                return {poem: true, data: ml};
            } else {
                return ml;
            }
        }
                    
        function to_paragraph(content) {
            return '<text:p text:style-name="Mountale.paragraph">' + to_fodt(content) + '</text:p>';
        }
        function to_line() {
            return '<text:p text:style-name="Mountale.line">***</text:p>';
        }
        function to_title(content) {
            var level = 0, i;
            for (i = 0; content[i] === '='; i++) {
                level ++;
            }
            return '<text:p text:style-name="Mountale.title.' + level + '">' + to_fodt(content.substring(level + 1)) + '</text:p>';
        }
        function to_discuss(content) {
            var lines, line, i, nb, result = [];
            lines = content.split('<br>');
            nb = lines.length;
            for (i = 0; i < nb; i++) {
                line = lines[i];
                result.push('<text:p text:style-name="Mountale.discuss">— ' + to_fodt(line.substring(2)) + '</text:p>');
            }
            return result.join('\n      ');
        }
        
        switch (true) {
            case /[A-Za-z]/.test(firstChar): return to_paragraph(content);
            case content === '---': return to_line();
            case firstChar === '-': return to_discuss(content);
            case firstChar === '=': return to_title(content);
            default: return to_paragraph(content);
        }
    },
    toJSON: function (DOMBlock) {
        //block.content et domBlockEdit
        'use strict'; 
        /* cette fonction ignore pour le moment totalement la façon dont se comporte le bloc de type CODE ainsi que le code inline */
        
        function wrapMarks(line) {
            /*
                À quoi sert d'envelopper les marques ?
                À préserver certaines expressions des transformations (notemment le guillemet simple en apostrophe dans certains cas et tout ce que l'on veut à l'aide des marques d'ignorement.
            */
            
            var regexA, regexB, o, c, m, el;
            //marques ouvrantes/fermantes
            for (el of app.OC_MARKERS) {
                o = el.o;
                c = el.c;
                regexA = new RegExp('(\\\\){1}\\' + o + '\\' + o + '(.*?)\\' + c + '\\' + c, 'g');
                regexB = new RegExp('\\' + o + '\\' + o + '(.*?)\\' + c + '\\' + c + '(?!<\\/b>)', 'g');
                line = line
                    .replace(
                        regexA,
                        '<i>$1</i><i>' + o + o + '</i>$2<i>' + c + c + '</i>'
                    ).replace(
                        regexB,
                        '<u>' + o + o + '</u>$1<u>' + c + c + '</u>'
                    );
            }
                
            //marques simples
            for (el of app.MARKERS) {
                m = el.mark;
                regexA = new RegExp('(\\\\){1}\\' + m + '\\' + m + '(.*?)(\\\\){1}\\' + m + '\\' + m, 'g');
                regexB = new RegExp('\\' + m + '\\' + m + '(?![^<]*<\\/b>)(.*?)\\' + m + '\\' + m + '(?![^<]*<\\/b>)', 'g');
                /*      \*\*(?![^<]*<\/b>)(.*?)\*\*(?![^<]*<\/b>)
                    Ceci se trouve dans regexB. La partie (?![^<]*<\/b>) sert à ne pas colorer les doubles étoiles qui peuvent servir de liste
                */
                line = line
                    .replace(
                        regexA,
                        '<b>$1' + m + m + '</b>$2<b>$3' + m + m + '</b>'
                    ).replace(
                        regexB,
                        '<b>' + m + m + '</b>$1<b>' + m + m + '</b>'
                    );
            }
                
            //marques d'ignorement de texte
            regexA = new RegExp('(\\\\){1}~~(.*?)(\\\\){1}~~', 'g'); // \~~ok\~~
            regexB = new RegExp('~~(.*?)~~(?!<\\/b>)', 'g');
            line = line
                .replace(regexA, '<b>$1~~</b>$2<b>$3~~</b>')
                .replace(regexB, '<b>~~$1~~</b>');

            //envelopper les espaces ne sert pas actuellement
            
            return line;
        }
        
        var lines = DOMBlock.split('<br>'), div, text, linesClean = [];
        
        for (var line of lines) {
            line = line.replace(/\s{2,}/g, ' ').trim();
            
            if (line !== '') {

                line = wrapMarks(line);
                
                // replace sentences not wrapped
                line = line.replace(/\'(?![^<]*<\/b>)/g, '’'); // apostrophe
                line = line.replace(/\.\.\./g, '…'); // points de suspension
                line = line.replace(/"\s*(.*?)\s*"/g, '« $1 »'); // doubles guillemets
                
                /*
                    Il est à la charge de l'utilisateur de mettre des espaces.
                    Pour lui simplifier la vie, chaque espace aux abords d'une
                    ponctuation sera correctement convertie.
                */
                
                // remove html
                div = document.createElement('div');
                div.innerHTML = line;
                line = div.textContent;
                
                // mettre dans le tableau
                linesClean.push(line);
            }
        }
        
        lines = linesClean
            .join('<br>')
            .replace(/\s{2,}/g, ' ')
            .trim();
        
        return lines;
    }
};

/* nav's buttons events */

app.btHtml.addEventListener('click', function () {
    'use strict';
    var blocks = app.compose.childNodes, block, el;
    
    //on masque nav et content
    for (el of app.allContentAndNav) {
        el.style.display = 'none';
    }
    //on affiche les elements de nav nécessaires
    for (el of app.inHtmlPreview.nav) {
        el.style.display = 'inline';
    }
    
    app.pageName.innerHTML = app.inHtmlPreview.name + ' (' + localStorage.getItem(app.currentDoc + '.name')  + ')';
    
    app.inHtmlPreview.content.innerHTML = '';
    //for (block of blocks) { //ES6
    for (var i = 0, nb = blocks.length; i < nb; i++) {
        block = blocks[i];
        if (block.textContent && block.textContent.trim() !== "") {
            app.inHtmlPreview.content.appendChild(convert.toHTML(block));
        }
    }
    
    //on affiche le content requis
    app.inHtmlPreview.content.style.display = 'block';

    app.btToggleSourcePreview.innerHTML = app.HTML_SOURCE;

}, false);
app.btSource.addEventListener('click', function () {
    'use strict';
    var el;
    
    //on masque nav et content
    for (el of app.allContentAndNav) {
        el.style.display = 'none';
    }
    //on affiche les elements de nav nécessaires
    for (el of app.inSource.nav) {
        el.style.display = 'inline';
    }
    
    app.pageName.innerHTML = app.inSource.name + ' (' + localStorage.getItem(app.currentDoc + '.name')  + ')';
    
    app.sourceContent.textContent = generateSource();
    app.inSource.content.style.display = 'block';
}, false);
app.btToggleSourcePreview.addEventListener('click', function () {
    'use strict';
    var bt = this, nodes, tab = [];

    if (bt.textContent === app.HTML_SOURCE) {
        bt.innerHTML = app.HTML_RENDER;
        app.htmlPreview.style.display = 'none';
        app.htmlSource.style.display = 'block';
        app.pageName.innerHTML = app.inHtmlSource.name + ' (' + localStorage.getItem(app.currentDoc + '.name')  + ')';
        generateHTML();
    } else {
        bt.innerHTML = app.HTML_SOURCE;
        app.htmlSource.style.display = 'none';
        app.htmlPreview.style.display = 'block';
        app.pageName.innerHTML = app.inHtmlPreview.name + ' (' + localStorage.getItem(app.currentDoc + '.name')  + ')';
    }
}, false);
app.btCompose.addEventListener('click', function () {
    'use strict';
    var el, block, blocks = [], node, firstDocBlocks, i, nb;
    
    //on masque nav et content
    for (el of app.allContentAndNav) {
        el.style.display = 'none';
    }
    //on affiche les elements de nav nécessaires
    for (el of app.inCompose.nav) {
        el.style.display = 'inline';
    }

    // load doc
    app.inCompose.content.innerHTML = '';
    if (app.currentDoc) {
        firstDocBlocks = JSON.parse(localStorage.getItem(app.currentDoc + '.blocks'));
        //for (block of firstDocBlocks) { //ES6
        nb = firstDocBlocks.length;
        if (nb === 0 || (nb === 1 && firstDocBlocks[0].content === "<br>")) { //aucun noeud
            firstDocBlocks = [];
            firstDocBlocks.push({content: "Let's go !", id: 1}); //à faire ici : mettre bon id + enregistrer dans LS
            localStorage.setItem(app.currentDoc + '.idMax', 1);
            nb = 1;
        }
                
        for (i = 0; i < nb; i++) {
            block = firstDocBlocks[i];
            
            node = document.createElement('p');
            node.id = block.id;
            node.innerHTML = block.content;
            if (node.textContent.trim() !== '') {
                app.inCompose.content.appendChild(node);
                blocks.push({content: block.content, id: block.id});
            }
            localStorage.setItem(app.currentDoc + '.blocks', JSON.stringify(blocks));
        }
    } else {
        setDoc(discoverDoc);
        for (block of discoverDoc.blocks) {
            node = document.createElement('p');
            node.id = block.id;
            node.innerHTML = block.content;
            app.inCompose.content.appendChild(node);
        }
    }
    
    app.inCompose.content.style.display = 'block';
    app.pageName.innerHTML = app.inCompose.name + ' (' + localStorage.getItem(app.currentDoc + '.name')  + ')';
}, false);
app.btFiles.addEventListener('click', function () {
    'use strict';
    var el, docs, uuid, node, nb, span, div, aEdit, aDelete, li;
    //on masque nav et content
    for (el of app.allContentAndNav) {
        el.style.display = 'none';
    }
    //on affiche les elements de nav nécessaires
    for (el of app.inFiles.nav) {
        el.style.display = 'inline';
    }
    app.pageName.innerHTML = app.inFiles.name;
    app.inputDocName.value = '';
    docs = JSON.parse(localStorage.getItem('docs'));
    nb = docs.length;
    app.listOfDocs.innerHTML = '';
    for (uuid of docs) {
       
        span = document.createElement('span');
        div = document.createElement('div');
        span.textContent = localStorage.getItem(uuid + '.name');

        li = document.createElement('li');
        li.className = 'doc';
        if (uuid === docs[0]) {
            li.style.color = 'purple';
        } else {
            aEdit = document.createElement('a');
            aEdit.textContent = 'Edit';
            aEdit.href = uuid;
            aEdit.className = 'btDocOption';
            aEdit.onclick = function (e) {
                e.preventDefault();
                var uuid = this.getAttribute('href');
                docs.splice(docs.indexOf(uuid), 1);
                docs.unshift(uuid);
                localStorage.setItem('docs', JSON.stringify(docs));
                app.currentDoc = uuid;
                app.btCompose.click();
            };
            div.appendChild(aEdit);
        }

        if (nb > 1) {
            aDelete = document.createElement('a');
            aDelete.textContent = 'Delete';
            aDelete.href = uuid;
            aDelete.className = 'btDocOption';
            aDelete.onclick = function (e) {
                e.preventDefault();
                var uuid = this.getAttribute('href');
                docs.splice(docs.indexOf(uuid), 1);
                localStorage.setItem('docs', JSON.stringify(docs));
                localStorage.removeItem(uuid + '.name');
                localStorage.removeItem(uuid + '.title');
                localStorage.removeItem(uuid + '.blocks');
                localStorage.removeItem(uuid + '.author');
                localStorage.removeItem(uuid + '.idMax');
                app.currentDoc = docs[0];
                app.btFiles.click();
            };
            div.appendChild(aDelete);
        }

        app.listOfDocs.appendChild(li);
        li.appendChild(span);
        li.appendChild(div);
    }

    app.inFiles.content.style.display = 'block';
}, false);
app.btOdt.addEventListener('click', function () {
    'use strict';
    var el;
    
    //on masque nav et content
    for (el of app.allContentAndNav) {
        el.style.display = 'none';
    }
    //on affiche les elements de nav nécessaires
    for (el of app.inOdt.nav) {
        el.style.display = 'inline';
    }
    
    app.pageName.innerHTML = app.inOdt.name + ' (' + localStorage.getItem(app.currentDoc + '.name')  + ')';
    
    app.inOdt.content.style.display = 'block';
}, false);

/* app.compose events */
app.compose.addEventListener('keydown', function (e) {
    var
        code = e.keyCode || e.which;
    
    if (code === app.TAB_KEY) {
        e.preventDefault();
        /* par la suite, insérer 4 espaces à chaque appui en partant du bord et pas de la position
        du curseur, bien que celle-ci joue un rôle (tab est pratique pour les tableaux) */
    }
    if (code === app.RETURN_KEY) {
        if (this.textContent === '') { //empêche la suppression de l'unique bloc vide
            e.preventDefault();
        }
    }
}, false);
app.compose.addEventListener('keypress', function (e) {
    'use strict';
    var
        code = e.keyCode || e.which,
        nodes,
        blk,
        node,
        newBlk,
        caret,
        blocks = [],
        nextBlk,
        sel,
        idMax,
        uuid;
    
    if (!e.shiftKey && code === app.ENTER_KEY) { // enter pressed
        
        sel = window.getSelection();
        var nb = app.currentBlock.length;
        if (nb > 1) { // more than one current block
            e.preventDefault();
            uuid = app.currentDoc;
            // store content not selected in last block
            var firstContent = app.currentBlock[0].textContent.substring(0, sel.anchorOffset).trim();
            var lastContent = app.currentBlock[nb - 1].textContent.substring(sel.focusOffset).trim();
            // delete all blocks except first in DOM
            for (var i = 1; i < nb - 1; i++) {
                app.compose.removeChild(app.currentBlock[i]);
            }
            // add stored value in content of first block
            app.currentBlock[0].textContent = firstContent;
            app.currentBlock[nb - 1].textContent = lastContent;
            //collapse
            sel.collapse(app.currentBlock[nb - 1], 0);
            // change currentBlock
            app.currentBlock = [app.currentBlock[nb - 1]];
            // LS
            //for (blk of app.compose.childNodes) { //ES6
            for (var i = 0, nb = app.compose.childNodes.length; i < nb; i++) {
                blk = app.compose.childNodes[i];
                if (blk.textContent.trim() !== '') {
                    node = {
                        content: blk.innerHTML,
                        id: blk.id
                    };
                    blocks.push(node);
                }
            }
            localStorage.setItem(uuid + '.blocks', JSON.stringify(blocks));
            console.log('push in LS : blocks', JSON.stringify(blocks));
            return;
        }
        
        
        blk = app.currentBlock[0];
        nextBlk = blk.nextSibling;
        if (blk.textContent.trim() === '') { // noeud vide : il faut le remplir pour créer un nouveau noeud
            e.preventDefault();
        } else { // création d'un nouveau noeud (bloc)
            caret = caretInfos(blk);
            uuid = app.currentDoc;
            idMax = localStorage.getItem(uuid + '.idMax');
            idMax ++;
            localStorage.setItem(uuid + '.idMax', idMax);
            e.preventDefault();
            newBlk = document.createElement('p');
            newBlk.id = idMax;
            newBlk.innerHTML = '<br>';

            if (caret && caret.start === 0 && caret.start === caret.end && caret.isEnd === false) { // curseur au début du bloc
                this.insertBefore(newBlk, blk);
                sel.collapse(newBlk, 1);

            } else if (caret && caret.start === caret.end && caret.isEnd === true) { // curseur à la fin du bloc
                blk.parentNode.insertBefore(newBlk, nextBlk);
                sel.collapse(newBlk, 1);

            } else { // curseur au milieu ou sélection
                if (caret.start === caret.end) { // curseur au milieu = scinde le contenu
                    newBlk.innerHTML = blk.textContent.substring(caret.start).trim();
                } else { // sélection : à méditer
                    newBlk.innerHTML = blk.textContent.substring(caret.end).trim();
                }

                blk.parentNode.insertBefore(newBlk, nextBlk);
                blk.innerHTML = blk.textContent.substring(0, caret.start).trim();
                sel.collapse(newBlk, 0);

            }

        }

    }
}, false);
app.compose.addEventListener('input', function () {
    'use strict';
    //save
    var uuid, node, blocks = [], blk;
    uuid = app.currentDoc;
    //for (blk of app.compose.childNodes) { //ES6
    for (var i = 0, nb = app.compose.childNodes.length; i < nb; i++) {
        blk = app.compose.childNodes[i];
        node = {
            content: blk.innerHTML,
            id: blk.id
        };
        blocks.push(node);
    }
    localStorage.setItem(uuid + '.blocks', JSON.stringify(blocks));
    console.log('push in LS : blocks', JSON.stringify(blocks));
}, false);
app.compose.addEventListener('click', function (e) {
    caretMoved();
}, false);
app.compose.addEventListener('keyup', function (e) {
    'use strict';
    //il se peut que opera préfère keypress à keyup : http://stackoverflow.com/a/14934765/4034421
    var
        code = e.keyCode || e.which,
        keys = [13, 33, 34, 37, 38, 39, 40]; // arrows, enter, page up & down

    if (keys.indexOf(code) !== -1) {
        caretMoved();
    }
}, false);
app.compose.addEventListener('blur', function (e) {
    caretMoved(true);
}, false);
app.compose.addEventListener('paste', function (e) {
    'use strict';
    
    function parseHTML(str) {
        var tmp = document.implementation.createHTMLDocument('Temp doc'); //create html doc with 'Temp doc' for title
        tmp.body.innerHTML = str;
        return tmp.body.children;
    }
    
    function getElementDefaultDisplay(tag) {
        var
            cStyle,
            t = document.createElement(tag),
            gcs = "getComputedStyle" in window;

        document.body.appendChild(t);
        cStyle = (gcs ? window.getComputedStyle(t, "") : t.currentStyle).display; 
        document.body.removeChild(t);

        return cStyle;
    }
    
    var
        htmlStr, txtStr,
        lines, line, nb, i, ensemble = [], final = '',
        currentBlock, lastCurrentBlock, currentId, debText, endText,
        prevBlock, idMax, elements, element, div, cursorPlace, caret, caret2,
        
        nodes, node, nodesClear = [], nodeClear, marker, tag, content, j, linesGrouped = [],
        footnotes = [], idNote;
    
    e.preventDefault();
    
    htmlStr = e.clipboardData.getData('text/html');
    
    if (htmlStr === '') {
        txtStr = e.clipboardData.getData('text/plain');
        if (txtStr.trim() !== '') { // plain text
            //console.log('texte pur : ', txtStr);
            lines = txtStr.split('\n');
            nb = lines.length;
            currentBlock = app.currentBlock[0];
            lastCurrentBlock = app.currentBlock[app.currentBlock.length - 1];
            currentId = currentBlock.id;
            
            caret = caretInfos(currentBlock);
            caret2 = caretInfos(lastCurrentBlock);
            debText = currentBlock.innerHTML.substring(0, caret.start);
            endText = lastCurrentBlock.innerHTML.substring(caret2.end);
            lines[0] = debText + lines[0];
            lines[nb - 1] = lines[nb - 1] + endText;
            
            //create blocks
            for (i = 0; i < nb; i++) {
                line = lines[i].trim();
                if (line !== '') {
                    ensemble.push(line);
                } else if (ensemble.length > 0) {
                    final += '<p>' + ensemble.join('<br>') + '</p>';
                    ensemble = [];
                }
            }
            if (ensemble.length > 0) {
                final += '<p>' + ensemble.join('<br>') + '</p>';
            }
            
            div = document.createElement('div');
            div.innerHTML = final;
            console.log(final);
            elements = div.childNodes;
            
            //what is the prev block ?
            if (currentBlock.previousSibling) {
                prevBlock = currentBlock.previousSibling;
            } else {
                prevBlock = null;
            }
            console.log(prevBlock);
            
            // remove current block
            nb = app.currentBlock.length;
            for (i = 0; i < nb; i++) {
                app.currentBlock[i].remove();
            }
             
            // add all p in dom with ids (first p's id = id of block removed)
            nb = elements.length;
            idMax = localStorage.getItem(app.currentDoc + '.idMax');
            for (i = 0; i < nb; i++) {
                element = elements[i];
                if (i === 0) {
                    element.id = currentId;
                } else {
                    idMax ++;
                    element.id = idMax;
                }
                console.log(element);
            }
            for (i = 0; i < nb; i++) {
                element = elements[0];
                if (prevBlock) {
                    app.compose.insertBefore(element, prevBlock.nextSibling);
                } else {
                    app.compose.insertBefore(element, app.compose.childNodes[0]);
                }
                prevBlock = element;
            }
            
            //give caret for last p add
            cursorPlace = element.innerHTML.length - endText.length;
            setCaret(element, {start: cursorPlace, end: cursorPlace});
            caretMoved();
            
            return;
        } else return;
    }
    
    //html text
    
    nodes = parseHTML(htmlStr);
    if (nodes.length === 0) {
        return;
    }
    
    //on enlève les types de noeuds qu'on ne veut pas garder et on gère les notes de bas de page de LibreOffice
    nb = nodes.length;
    for (i = 0; i < nb; i++) {
        node = nodes[i];
        if (node.nodeName !== 'STYLE' && node.nodeName !== 'META' && node.nodeName !== 'TITLE') {
            nodeClear = document.createElement(node.nodeName);
            if (!/^sdfootnote/.test(node.id)) { //ODT File footnote
                nodeClear.innerHTML = node.innerHTML.replace(/(\r\n|\n|\r)/gm, ' ').replace(/&nbsp;/g, ' ').replace(/<br>$/, '').trim();
                if(nodeClear.textContent === '') {
                    nodeClear.innerHTML = '---';
                }
                nodesClear.push(nodeClear);
            } else {
                idNote = node.id.replace(/^sdfootnote([0-9]+)$/, '$1');
                node = node
                    .lastElementChild
                    .innerHTML
                    .replace(/(\r\n|\n|\r)/gm, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/<br>$/, '')
                    .trim()
                    .replace(/\s+/g, ' ');
                
                app.MARKERS.map(function (el) {
                    marker = new RegExp('\\<' + el.html + '\\>\\s*(.*?)\\s*' + '\\<\\/' + el.html + '\\>', 'g');
                    node = node.replace(marker, el.mark + el.mark + '$1' + el.mark + el.mark);
                });
                div = document.createElement('div');
                div.innerHTML = node;
                node = div.textContent;
                footnotes.push(node.substring(idNote.length));
            }
        }
    }
    nb = nodesClear.length;
    if (nb === 0) {
        return;
    }
    if (footnotes.length > 0 && nb === 1) {
        //on transforme l'unique élément de nodesClear en span pour entrer dans le cas A
        nodeClear = nodesClear[0];
        node = document.createElement('span');
        node.innerHTML = nodeClear.innerHTML;
        nodesClear = [node];
    }
    
    console.log(nodesClear); // cas possibles : A : [span, strong, truc_inline] ou B : [h1, p, p, truc_block], mais jamais de mélange block/inline
    
    
    
    if (getElementDefaultDisplay(nodesClear[0].nodeName) === 'inline') { // cas A
        console.log('inline');
        // on joint les éléments du tableau
        line = '';
        for (i = 0; i < nb; i++) {
            node = nodesClear[i];
            line += node.outerHTML;
        }
        // on transforme les tags reconnus en marques
        
        // footnote
        console.log(line);
        if (footnotes.length > 0) {
            var monTableau = line.match(/<a(.*?)><sup>(.*?)<\/sup><\/a>/g);
            for (i = 0, nb = footnotes.length; i < nb; i++) {
                line = line.replace(monTableau[i], '((' + footnotes[i] + '))');
            }
        }
        
        app.MARKERS.map(function (el) {
            marker = new RegExp('\\<' + el.html + '\\>\\s*(.*?)\\s*' + '\\<\\/' + el.html + '\\>', 'g');
            line = line.replace(marker, el.mark + el.mark + '$1' + el.mark + el.mark);
        });

        // on transforme les &truc; en leur équivalent textuel : à faire si ça ne se fait pas tout seul avec le textContent
        console.log(line);
        line = line.replace('&nbsp;', ' ').replace('&amp;', '&');
        console.log(line);
        
        // on transforme les <br> et <br/> en un truc très très rare
        
        // on crée un noeud dont le innerHTML prend la nouvelle chaine
        div = document.createElement('div');
        div.innerHTML = line;
        // on récupère de ce noeud le textContent
        line = div.textContent;
        console.log(line);
        // on remet les br dans le résultat du textContent
        
        // on ajoute le résultat dans le bloc à la position du curseur
        currentBlock = app.currentBlock[0];
        lastCurrentBlock = app.currentBlock[app.currentBlock.length - 1];
        caret = caretInfos(currentBlock);
        caret2 = caretInfos(lastCurrentBlock);
        debText = currentBlock.innerHTML.substring(0, caret.start);
        endText = lastCurrentBlock.innerHTML.substring(caret2.end);
        currentBlock.innerHTML = debText + line + endText;
        // on supprime les blocs courants sauf le premier
        nb = app.currentBlock.length;
        for (i = 1; i < nb; i++) {
            app.currentBlock[i].remove();
        }
        // on place le curseur où il faut
        cursorPlace = currentBlock.innerHTML.length - endText.length;
        setCaret(currentBlock, {start: cursorPlace, end: cursorPlace});
        // on lance la fonction pour redéfinir le bloc courant
        caretMoved();
        return;
    }
    
    // cas B
    
    console.log('cas B : blocks');
    nodes = [];
    for (i = 0; i < nb; i++) {
        node = nodesClear[i];
        line = node.innerHTML;
        // footnote
        var monTableau = line.match(/<a(.*?)><sup>(.*?)<\/sup><\/a>/g) ;
        if (monTableau) { 
            console.log(footnotes);
            console.log(monTableau);
            for (j = 0; j < monTableau.length; j++) {
                line = line.replace(monTableau[j], '((' + footnotes[j] + '))');
            }
        }
        
        app.MARKERS.map(function (el) {
            marker = new RegExp('\\<' + el.html + '\\>\\s*(.*?)\\s*' + '\\<\\/' + el.html + '\\>', 'g');
            line = line.replace(marker, el.mark + el.mark + '$1' + el.mark + el.mark);
        });
        div = document.createElement('div');
        div.innerHTML = line;
        nodes.push({tag: node.nodeName, content: div.textContent});
    }
    console.log(nodes);
    nb = nodes.length;
    lines = [];
    for (i = 0; i < nb; i++) {
        node = nodes[i];
        tag = node.tag;
        content = node.content;
        console.log(i);
        if (/^[—–-]\s/.test(content)) { // discuss
            console.log(nodes[i]);
            for (i; nodes[i] && /^[—–-]\s/.test(nodes[i].content); i++) {
                console.log('i: ', i);
                linesGrouped.push(nodes[i].content.replace(/^[—–-]\s/, '- '));
                //i++;
            }

            lines.push(linesGrouped.join('<br>'));
            console.log(lines);
            linesGrouped = [];
            i--;
        } else { // parag.
            lines.push(content);
        }
    }
    
    console.log(lines);
    
    nb = lines.length;
    currentBlock = app.currentBlock[0];
    idMax = localStorage.getItem(app.currentDoc + '.idMax');
    for (i = 0; i < nb; i++) {
        if (i === 0 && currentBlock.textContent.trim() === '') {
            currentBlock.innerHTML = lines[i];
        } else {
            idMax ++;
            node = document.createElement('p');
            node.innerHTML = lines[i];
            node.id = idMax;
            app.compose.insertBefore(node, currentBlock.nextSibling);
        }
        
        currentBlock = node;
        //cursorPlace = node.innerHTML.length;
        //setCaret(node, {start: cursorPlace, end: cursorPlace})
        caretMoved();
    }
        
        /*var
            HTMLNodes = parseHTML(htmlStr),
            node,
            tag,
            HTMLClearNodes = [],
            virtualDiv = document.createElement('div'),
            exceptAttrs = ['href', 'alt', 'src'],
            walk_the_DOM = function walk (node, func) {
                func(node);
                node = node.firstChild;
                while (node) {
                    walk(node, func);
                    node = node.nextSibling;
                }
            },
            attributes,
            nodes = [],
            textContent,
            innerHTML;
        
        for (var i = 0, nb = HTMLNodes.length; i < nb; i++) {
            node = HTMLNodes[i];
            textContent = node.textContent.replace(/(\r\n|\n|\r)/gm, ' ').trim();
            if (textContent !== '' || (node.nodeName !== 'STYLE' && node.nodeName !== 'META')) {
                tag = node.localName;
                innerHTML = node.innerHTML.replace(/(\r\n|\n|\r)/gm, ' ').trim();
                HTMLClearNodes.push('<' + tag + '>' + innerHTML + '</' + tag + '>');
            }
        }
        
        virtualDiv.innerHTML = HTMLClearNodes.join('');
        */
        /*
            On parcourt le DOM de virtualDiv afin de supprimer
            tous les attributs (exceptés ceux de 'exceptAttrs').
        */
        /*walk_the_DOM(virtualDiv, function(el) {
            if(el.nodeType === 1) {  //1 = element node
                if (el.hasAttributes()) {
                    attributes = el.attributes;
                    var nb = attributes.length;
                    while (nb--) {
                        var attr = attributes[nb];
                        // Si attr.name n'est pas trouvé dans le tableau 'exceptAttrs'.
                        if (exceptAttrs.indexOf(attr.name) === -1) {
                            el.removeAttribute(attr.name);
                        }
                    }
                }
            }
        });

        // On débale tous les éléments, sauf certains dont on veut conserver le tag.
        var
            selector = 
                '*:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)' +
                ':not(p):not(blockquote):not(ul):not(ol):not(li):not(hr):not(br):not(a)' +
                ':not(i):not(em):not(b):not(strong):not(u):not(mark):not(sup):not(sub):not(code)',
            elements = virtualDiv.querySelectorAll(selector),
            el, parent;
        
        for (var i = 0, nb = elements.length; i < nb; i++) { 
            el = elements[i];
            parent = el.parentNode;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        }
        
        console.log(virtualDiv.innerHTML);
        */
        /*
            Conversion des balises HTML inlines en PBML.
            Il serait bien d'avoir une constante 'correspondanceTable' pour
            clarifier les choses. Il y a déjà ceci dans converter.js sous le
            nom de 'var equiv'.
        */
        /*var
            txt = virtualDiv.innerHTML,
            simplesInlineTags = [
                'i', 'em', 'b', 'strong', 'u', 'mark', 'sup', 'sub', 'code'
            ],
            simplesInlineMarks = [
                '\'', '\'', '*', '*', '|', '_', '^', ',', '`'
            ],
            tag,
            char,
            regex;
        
        for (var i = 0, nb = simplesInlineMarks.length; i < nb; i++) {
            tag = simplesInlineTags[i];
            char = simplesInlineMarks[i];
            regex = new RegExp('<' + tag + '>(.*?)<\/' + tag + '>', 'ig');
            txt = txt.replace(regex, char + char + '$1' + char + char);        
        }
        
        */
        //améliorer cette partie sérieusement :
        /*
            - il n'y a pas que le &nbsp; à remplacer
            - en plus des liens, il y a les notes et les images
        */
        /*txt = txt
            .replace(/<a href="(.*?)">(.*?)<\/a>/ig, '[[$2|$1]]')
            .replace(/&nbsp;/g, ' ')
            .trim();
        
        console.log(txt);
        
        var
            nodes = parseHTML(txt),
            node,
            tag,
            tab_disc = [],
            regex = /^[—–-]\s/g,
            HTMLEl = [];
        
        if (nodes.length === 0) { //on n'a pas un noeud de type bloc mais un simple contenu inline
            currentBlock = app.currentBlock[0];
            caret = caretInfos(currentBlock);
            debText = currentBlock.innerHTML.substring(0, caret.start);
            endText = currentBlock.innerHTML.substring(caret.end);
            
            currentBlock.innerHTML = debText + txt + endText;
            
            cursorPlace = currentBlock.innerHTML.length - endText.length;
            setCaret(currentBlock, {start: cursorPlace, end: cursorPlace}); //merde quand le curseur est après un br dans le bloc
            caretMoved();
            
            return;
        }
        
        console.log(nodes); // J'EN SUIS ICIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
        for (var i = 0, nb = nodes.length; i < nb; i++) {
            node = nodes[i];
            tag = node.localName;
            innerHTML = node.innerHTML.trim();
            if (/^[—–-]\s/g.test(innerHTML)) {
                tab_disc.push(innerHTML.replace(/^[—–-]\s/g, ''));
                for (i = i; (i < nb - 1) && (/^[—–-]\s/g.test(nodes[i].nextSibling.innerHTML)); i++) {
                    tab_disc.push(nodes[i+1].innerHTML.trim().replace(/^[—–-]\s/g, ''));
                }
                console.log(tab_disc);
                tab_disc = tab_disc.map(function (el, i) {
                    return ['<p>', el, '</p>'].join('');
                });
                HTMLEl.push('<div>' + tab_disc.join('') + '</div>');
                console.log('<div>' + tab_disc.join('') + '</div>');
                tab_disc = [];
            } else {
                HTMLEl.push('<'+tag+'>' + innerHTML + '</'+tag+'>');
            }
            
        }

        htmlObj = parseHTML(HTMLEl.join(''));

        var node, nodeName, textContent, innerHTML, contents = [];
        for (var i = 0, nb = htmlObj.length; i < nb; i++) {
            node = htmlObj[i];
            nodeName = node.nodeName;
            textContent = node.textContent;
            innerHTML = node.innerHTML;
            
            switch (true) {                    
                case nodeName === 'P':
                    if (textContent !== '' 
                        && !/^\s*$/.test(textContent) 
                        && !/^\/\/\/$/.test(textContent)
                    ) {
                        contents.push(textContent);
                    }
                    break;
                    
                case nodeName === 'DIV':
                    var elts = parseHTML(innerHTML), tabReplics = [];
                    for (var j = 0, nbElts = elts.length; j < nbElts; j++) {
                        tabReplics.push('- ' + elts[j].textContent);
                    }
                    contents.push(tabReplics.join('\n'));
				    break;
                    
                case /^H[1-6]$/i.test(nodeName):
				    var
                        lvl = parseInt(nodeName.substring(1)),
                        type = new Array(lvl + 1).join('=');
                    contents.push(type + ' ' + textContent);
				    break;
                    
                case nodeName === 'HR':
                    contents.push('---');
				    break;
                    
                case /^[UO]L$/i.test(nodeName):
                    //todo (evolution) : multi levels + ul/ol distinction
                    var
                        tabLi = node.childNodes,
                        items = [],
                        nb = tabLi.length,
                        el = '';
                    
                    for (var j = 0; j < nb; j++) {
                        items.push('* ' + tabLi[j].textContent);
                    }
                    contents.push(items.join('\n'));
                    break;
                
                default: //tout devient p
                    if (textContent !== '' 
                        && !/^\s*$/.test(textContent) 
                        && !/^\/\/\/$/.test(textContent)
                    ) {
                        contents.push(textContent);
                    }
                    break;
            }
        }
    }
    return contents || [];
    */
    
    
    

}, false);

/* Files : events */

app.btDocAdd.addEventListener('click', function(e) {
    'use strict';
    addDoc(e);
}, false);
app.inputDocName.addEventListener('keypress', function(e) {
    'use strict';
    if (e.keyCode === 13) addDoc(e);
}, false);
app.btOpenFile.addEventListener('change', handleFiles, false);

/* HTML Source : events */

app.htmlOptsFull.addEventListener('change', function () {
    'use strict';
    generateFull(this);
}, false);
app.htmlOptsPrefix.addEventListener('input', function () {
    'use strict';
    generateHTML();
}, false);

/* Source file : events */

app.btExportTale.addEventListener('click', saveTextAsFile, false);

/* FODT file : events */

app.btExportOdt.addEventListener('click', saveTextAsOdt, false);

/* Init. app */

//localStorage.clear();
app.btCompose.click();

/*
    on ne veut jamais de bloc vide dans le ls :
    -> un bloc vide disparait du dom et du ls (s'il y est) s'il perd le focus
*/