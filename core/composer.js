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
    
    //navbars
    nav: document.getElementById('nav'), //inutilisé
    pageName: document.getElementById('pageName'),
    
    btFiles: document.getElementById('btFiles'),
    btHtml: document.getElementById('btHtml'),
    btCompose: document.getElementById('btCompose'),
    btToggleSourcePreview: document.getElementById('btToggleSourcePreview'),
    btSource: document.getElementById('btSource'),

    //keys
    ENTER_KEY: 13,

    //markers
    MARKERS: [
        {mark: '\'', html: 'em', entity: '&apos;'},
        {mark: '*', html: 'strong', entity: '&ast;'},
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
        nav: [btFiles, btSource, btHtml],
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
    allContentAndNav: [
        files, compose, htmlPreview, htmlSource, source,
        btFiles, btCompose, btHtml, btToggleSourcePreview, btSource
    ],

    //constants
    HTML_SOURCE: 'HTML_CODE',
    HTML_RENDER: 'HTML_RENDER'
};

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
    for (node of nodes) {
        block = document.createElement(node.tagName);
        block.innerHTML = node.innerHTML;
        if (node.classList && node.classList.contains('poem')) {
            block.className = 'poem';
        }
        if (prefix !== '') block.id = prefix + node.id;
        article.appendChild(block);
    }

    // footnotes in blocks
    nb = nodes.length;
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
        uuid = JSON.parse(localStorage.getItem('docs'))[0],
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
        console.log("ici");
        return [nodeDeb];
    }
    
    
    uuid = JSON.parse(localStorage.getItem('docs'))[0];
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
        el = blocks[i];

        if (el === idDeb) {
            nodes.push(document.getElementById(el));
            i++;
            for (i; i < nb; i++) {
                el = blocks[i];
                nodes.push(document.getElementById(el));
                if (el === idEnd) {
                    break;
                }
            }
            break;
        }
    }
    console.log(nodes);
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

function caretMoved() {
    'use strict';
    /*var nodes, node, id, oldNode;

    nodes = caretNodes();
    console.log(nodes);

    for (oldNode of app.currentBlock) {
        id = oldNode.id;
        if (oldNode.textContent.trim() !== '') {
            //donne des conversions a l'ancien noeud courant UNIQUEMENT s'il ne fait pas partie des noeuds courants
            if (nodes.indexOf(oldNode) === -1) {
                oldNode.innerHTML = convert.toJSON(oldNode.innerHTML);
            }
        }
    }*/

    app.currentBlock = caretNodes();
}

function saveTextAsFile() {
    'use strict';
    // grab the content of the form field and place it into a variable
    var textToWrite = app.sourceContent.textContent;
    //  create a new Blob (html5 magic) that contains the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], {type:'application/json'});
    // Specify the name of the file to be saved
    var fileNameToSaveAs = localStorage.getItem(JSON.parse(localStorage.getItem('docs'))[0] + '.name') + '.tale';

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
            content: "= Découverte de Mountale",
            id: 1
        },
        {
            content: "Ce document permet de saisir rapidement le fonctionnement de l’application. Ici se trouve l'éditeur. C'est là que l'on écrit du texte qui est converti en HTML lorsque l'on clique sur HTML (en haut de page). La syntaxe permet de créer des titres, des paragraphes, des listes, des citations, etc. Elle permet également l'insertion de gras, d'italique, de liens, etc. C'est ce que nous allons voir dans ce document. Une documentation sera mise en place prochainement. (note : la suite de ce document est actuellement en cours de réécriture, car le fonctionnement et l'interface du logiciel ont changé récemment.)",
            id: 2
        },
        {
            content: "== Les blocs d’écriture",
            id: 3
        },
        {
            content: "=== Les titres",
            id: 4
        },
        {
            content: "Ils disposent de 1 à 6 symboles =.",
            id: 9
        },
        {
            content: "=== Le dialogue",
            id: 10
        },
        {
            content: "- Salut Jack !<br>- Salut John. T’as fait quoi hier ?",
            id: 11
        },
        {
            content: "=== La liste",
            id: 12
        },
        {
            content: "* capucin<br>* mandrill<br>* orang-outan",
            id: 13
        },
        {
            content: "Autre exemple :",
            id: 14
        },
        {
            content: "* fruits<br>1** bananes<br>** figues<br>** ananas<br>* légumes<br>1** courgettes<br>** navets",
            id: 15
        },
        {
            content: "=== Le saut",
            id: 16
        },
        {
            content: "---",
            id: 17
        },
        {
            content: "=== La citation",
            id: 18
        },
        {
            content: "> Fight Club<br>C’est seulement quand on a tout perdu qu’on est libre de faire tout ce qu’on veut.<br><",
            id: 19
        },
        {
            content: "=== La figure",
            id: 20
        },
        {
            content: "! Légende de l’image<br>{{image d’une personne qui clique sur son ordinateur|https://pixabay.com/static/uploads/photo/2015/07/28/22/04/woman-865111_960_720.jpg}}",
            id: 21
        },
        {
            content: "== Le texte",
            id: 22
        },
        {
            content: "Il est possible d’insérer des marques au sein du texte afin d’obtenir du gras, de l’italique, des liens, des notes de bas de page, etc. Le bloc qui suit contient tous les marquages possibles.",
            id: 23
        },
        {
            content: "Voici une image flottante à gauche {{alt|25|l|https://pixabay.com/static/uploads/photo/2015/07/28/22/04/woman-865111_960_720.jpg}}, du **gras**, de l’''italique'', du ||texte surligné||, du ``code informatique``, un ^^exposant^^ et un ,,indice,,, une note((Texte de la note)) de bas de page, un [[lien|http://www.google.fr]] et pour finir, du __texte souligné__. Pour plus de détails et savoir quand se servir de telle ou telle marque, il faut consulter la documentation.",
            id: 24
        },
        {
            content: "Il se peut que l’on souhaite afficher, par exemple, des paires d’étoiles autour d’un mot sans le mettre en gras, ou afficher un texte entouré de deux parenthèses sans que cela ne devienne une note. Voici comment faire :",
            id: 25
        },
        {
            content: "Ceci n’est \\**pas en gras\\** et cela n’est \\((pas une note)).",
            id: 26
        },
        {
            content: "Enfin, certains caractères ou ensemble de caractères se convertissent automatiquement (lorsque le bloc passe en mode aperçu). C’est le cas de « ~~'~~ » qui se transforme en apostrophe typographique et de « ~~...~~ » qui se transforme en vrais points de suspension. Les espaces se convertissent également en espaces insécables lorsque cela est nécessaire. Pour empêcher cette conversion, il convient d’envelopper de « ~ » (tilde), le caractère ou l’ensemble de caractères que l’on ne souhaite pas convertir.",
            id: 27
        },
        {
            content: "---",
            id: 28
        },
        {
            content: "Il est utile de conserver ce document pour y dégoter une information oubliée. Pour créer ton premier document, clique sur l’onglet en haut à gauche qui représente deux pages l’une sur l’autre, insère un nom et c’est parti. Bonne rédaction !",
            id: 29
        }
    ],
    name: "Discover",
    title: "Mountale first document",
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
            case firstChar === '!': return to_figure(block);
            case /^1?\*{1}\s/.test(content): return to_list(block);
            default: return to_paragraph(block);
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
    
    app.pageName.innerHTML = app.inHtmlPreview.name + ' (' + localStorage.getItem(JSON.parse(localStorage.getItem('docs'))[0] + '.name')  + ')';
    
    app.inHtmlPreview.content.innerHTML = '';
    for (block of blocks) {
        app.inHtmlPreview.content.appendChild(convert.toHTML(block));
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
    
    app.pageName.innerHTML = app.inSource.name + ' (' + localStorage.getItem(JSON.parse(localStorage.getItem('docs'))[0] + '.name')  + ')';
    
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
        app.pageName.innerHTML = app.inHtmlSource.name + ' (' + localStorage.getItem(JSON.parse(localStorage.getItem('docs'))[0] + '.name')  + ')';
        generateHTML();
    } else {
        bt.innerHTML = app.HTML_SOURCE;
        app.htmlSource.style.display = 'none';
        app.htmlPreview.style.display = 'block';
        app.pageName.innerHTML = app.inHtmlPreview.name + ' (' + localStorage.getItem(JSON.parse(localStorage.getItem('docs'))[0] + '.name')  + ')';
    }
}, false);
app.btCompose.addEventListener('click', function () {
    'use strict';
    var el, block, node, docs, firstDocBlocks;
    
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
    docs = JSON.parse(localStorage.getItem('docs')) || [];
    if (docs.length > 0) {
        firstDocBlocks = JSON.parse(localStorage.getItem(docs[0] + '.blocks'));
        for (block of firstDocBlocks) {
            node = document.createElement('p');
            node.id = block.id;
            node.innerHTML = block.content;
            app.inCompose.content.appendChild(node);
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
    app.pageName.innerHTML = app.inCompose.name + ' (' + localStorage.getItem(JSON.parse(localStorage.getItem('docs'))[0] + '.name')  + ')';
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

/* app.compose events */

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
            uuid = JSON.parse(localStorage.getItem('docs'))[0];
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
            for (blk of app.compose.childNodes) {
                if (blk.textContent.trim() !== '') {
                    node = {
                        content: blk.innerHTML,
                        id: blk.id
                    };
                    blocks.push(node);
                }
            }
            localStorage.setItem(uuid + '.blocks', JSON.stringify(blocks));
            return;
        }
        
        
        blk = app.currentBlock[0];
        nextBlk = blk.nextSibling;
        if (blk.textContent.trim() === '') { // noeud vide : il faut le remplir pour créer un nouveau noeud
            e.preventDefault();
        } else { // création d'un nouveau noeud (bloc)
            console.log("newblock");
            caret = caretInfos(blk);
            uuid = JSON.parse(localStorage.getItem('docs'))[0];
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
                console.log("fin de bloc : ", blk, newBlk, nextBlk);
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
    uuid = JSON.parse(localStorage.getItem('docs'))[0];
    for (blk of app.compose.childNodes) {
        node = {
            content: blk.innerHTML,
            id: blk.id
        };
        blocks.push(node);
    }
    localStorage.setItem(uuid + '.blocks', JSON.stringify(blocks));
}, false);
app.compose.addEventListener('click', caretMoved, false);
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

/* Init. app */

//localStorage.clear();
app.btCompose.click();


/* TODO
    ok - apostrophe typo et autres avec convert.toJSON (3fev)
        → clic ailleurs que dans un bloc doit fonctionner
    - nettoyage max (5fev)
        → l'uuid du document pourrait etre mémorisé dans une variable pour ne pa retourner le chercher dans le ls à chaque fois
        → bien commenter
    - test sur autres navigateurs (5fev)
        → fonctionnne sur chrome et firefox. Un problème sur Opera à régler
    - GITHUB V0.5 AGPLv3 (6-7fev) 
        + documentation
        + discover doc
*/