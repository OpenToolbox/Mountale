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
                    localStorage.setItem(app.currentDoc + '.idMax', idMax);
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
        
        // on transforme les <br> et <br/> en un truc très très rare
        line = line.replace(/<br><\/br>/g, '‹ßř>');
        line = line.replace(/<br>/g, '‹ßř>');
        line = line.replace(/<br\/>/g, '‹ßř>');
        
        // on crée un noeud dont le innerHTML prend la nouvelle chaine
        div = document.createElement('div');
        div.innerHTML = line;
        line = div.textContent.replace(/‹ßř>/g, '<br>');
        
        // on ajoute le résultat dans le bloc à la position du curseur
        currentBlock = app.currentBlock[0];
        lastCurrentBlock = app.currentBlock[app.currentBlock.length - 1];
        caret = caretInfos(currentBlock);
        caret2 = caretInfos(lastCurrentBlock);
        console.log(caret); console.log(caret2);
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
            localStorage.setItem(app.currentDoc + '.idMax', idMax);
        }
        
        currentBlock = node;
        //cursorPlace = node.innerHTML.length;
        //setCaret(node, {start: cursorPlace, end: cursorPlace})
        caretMoved();
    }

}, false);