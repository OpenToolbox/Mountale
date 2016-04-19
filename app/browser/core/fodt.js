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

function getfOdt() {
    var meta, allStyles, i, nb, pre = 'Mountale.', s, styles, props1, props2, props3, prop1, prop2, prop3, j, nb1, body, text, nodes, node, xmlDoc;

    meta = '<office:meta/>'; //on peut insérer l'auteur et la date de génération dans meta

    allStyles = [
        //block
        {
            style: [
                {key: 'style:name', val: pre + 'paragraph'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '0cm'},
                {key: 'fo:margin-right', val: '0cm'},
                {key: 'fo:text-indent', val: '0.5cm'},
                {key: 'fo:text-align', val: 'justify'},
                {key: 'style:auto-text-indent', val: 'false'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'line'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '0cm'},
                {key: 'fo:margin-right', val: '0cm'},
                {key: 'fo:margin-top', val: '0.5cm'},
                {key: 'fo:margin-bottom', val: '0.5cm'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'fo:text-align', val: 'center'},
                {key: 'style:auto-text-indent', val: 'false'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'discuss'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'discuss'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-top', val: '0.25cm'},
                {key: 'fo:margin-bottom', val: '0.25cm'},
                {key: 'loext:contextual-spacing', val: 'true'},
                {key: 'fo:text-align', val: 'justify'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0.5cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'title.1'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '2cm'},
                {key: 'fo:margin-right', val: '2cm'},
                {key: 'fo:margin-top', val: '4cm'},
                {key: 'fo:margin-bottom', val: '3cm'},
                {key: 'loext:contextual-spacing', val: 'false'},
                {key: 'fo:text-align', val: 'center'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ],
            textProperties: [
                {key: 'fo:font-size', val: '28pt'},
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'title.2'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '3cm'},
                {key: 'fo:margin-right', val: '3cm'},
                {key: 'fo:margin-top', val: '3cm'},
                {key: 'fo:margin-bottom', val: '2cm'},
                {key: 'loext:contextual-spacing', val: 'false'},
                {key: 'fo:text-align', val: 'center'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ],
            textProperties: [
                {key: 'fo:font-size', val: '24pt'},
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'title.3'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '3.5cm'},
                {key: 'fo:margin-right', val: '3.5cm'},
                {key: 'fo:margin-top', val: '3cm'},
                {key: 'fo:margin-bottom', val: '2cm'},
                {key: 'loext:contextual-spacing', val: 'false'},
                {key: 'fo:text-align', val: 'center'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ],
            textProperties: [
                {key: 'fo:font-size', val: '20pt'},
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'title.4'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '0cm'},
                {key: 'fo:margin-right', val: '0cm'},
                {key: 'fo:margin-top', val: '3cm'},
                {key: 'fo:margin-bottom', val: '2cm'},
                {key: 'loext:contextual-spacing', val: 'false'},
                {key: 'fo:text-align', val: 'left'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ],
            textProperties: [
                {key: 'fo:font-size', val: '18pt'},
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'title.5'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '0cm'},
                {key: 'fo:margin-right', val: '0cm'},
                {key: 'fo:margin-top', val: '3cm'},
                {key: 'fo:margin-bottom', val: '2cm'},
                {key: 'loext:contextual-spacing', val: 'false'},
                {key: 'fo:text-align', val: 'left'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ],
            textProperties: [
                {key: 'fo:font-size', val: '16pt'},
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'title.6'},
                {key: 'style:family', val: 'paragraph'},
                {key: 'style:parentStyleName', val: 'Standard'},
                {key: 'style:nextStyleName', val: pre + 'paragraph'}
            ],
            paragraphProperties: [
                {key: 'fo:margin-left', val: '0cm'},
                {key: 'fo:margin-right', val: '0cm'},
                {key: 'fo:margin-top', val: '3cm'},
                {key: 'fo:margin-bottom', val: '2cm'},
                {key: 'loext:contextual-spacing', val: 'false'},
                {key: 'fo:text-align', val: 'left'},
                {key: 'style:justify-single-word', val: 'false'},
                {key: 'fo:text-indent', val: '0cm'},
                {key: 'style:auto-text-indent', val: 'false'}
            ],
            textProperties: [
                {key: 'fo:font-size', val: '14pt'},
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        //inline
        {
            style: [
                {key: 'style:name', val: pre + 'bold'},
                {key: 'style:family', val: 'text'}
            ],
            textProperties: [
                {key: 'fo:font-weight', val: 'bold'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'italic'},
                {key: 'style:family', val: 'text'}
            ],
            textProperties: [
                {key: 'fo:font-style', val: 'italic'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'underline'},
                {key: 'style:family', val: 'text'}
            ],
            textProperties: [
                {key: 'style:text-underline-style', val: 'solid'},
                {key: 'style:text-underline-width', val: 'auto'},
                {key: 'style:text-underline-color', val: 'font-color'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'highlight'},
                {key: 'style:family', val: 'text'}
            ],
            textProperties: [
                {key: 'fo:background-color', val: '#ffff00'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'superscript'},
                {key: 'style:family', val: 'text'}
            ],
            textProperties: [
                {key: 'style:text-position', val: 'super 58%'}
            ]
        },
        {
            style: [
                {key: 'style:name', val: pre + 'subscript'},
                {key: 'style:family', val: 'text'}
            ],
            textProperties: [
                {key: 'style:text-position', val: 'sub 58%'}
            ]
        }
    ];

    styles = '<office:styles>\n';
    nb = allStyles.length;
    for (i = 0; i < nb; i++) {
        s = allStyles[i];
        props1 = '';
        nb1 = s.style.length;
        for (j = 0; j < nb1; j++) {
            prop1 = s.style[j];
            props1 += prop1.key + '="' + prop1.val + '" ';
        }
        styles += '    <style:style ' + props1 + '>\n';
        if (s.paragraphProperties) {
            props2 = '';
            nb1 = s.paragraphProperties.length;
            for (j = 0; j < nb1; j++) {
                prop2 = s.paragraphProperties[j];
                props2 += prop2.key + '="' + prop2.val + '" ';
            }
            styles += '      <style:paragraph-properties ' + props2 + '/>\n';
        }
        if (s.textProperties) {
            props3 = '';
            nb1 = s.textProperties.length;
            for (j = 0; j < nb1; j++) {
                prop3 = s.textProperties[j];
                props3 += prop3.key + '="' + prop3.val + '" ';
            }
            styles += '      <style:text-properties ' + props3 + '/>\n';
        }
        styles += '    </style:style>\n';
    }
    styles += '  </office:styles>';

    text = '    <office:text>\n';
    nodes = JSON.parse(localStorage.getItem(app.currentDoc + '.blocks'));
    nb = nodes.length;
    for (i = 0; i < nb; i++) {
        node = nodes[i];
        text += '      ' + convert.toFODT(node) + '\n';
    }
    text += '    </office:text>';

    body = '<office:body>\n' + text + '</office:body>';

    xmlDoc = 
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!-- Generated with Mountale, an opensource app for writers (http://svenseitan.github.io). -->\n\n' +
        '<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0" xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0" xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0" xmlns:ooo="http://openoffice.org/2004/office" xmlns:ooow="http://openoffice.org/2004/writer" xmlns:oooc="http://openoffice.org/2004/calc" xmlns:dom="http://www.w3.org/2001/xml-events" xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:rpt="http://openoffice.org/2005/report" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:grddl="http://www.w3.org/2003/g/data-view#" xmlns:officeooo="http://openoffice.org/2009/office" xmlns:tableooo="http://openoffice.org/2009/table" xmlns:drawooo="http://openoffice.org/2010/draw" xmlns:calcext="urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0" xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0" xmlns:formx="urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0" xmlns:css3t="http://www.w3.org/TR/css3-text/" office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">\n' +
            '  ' + meta + '\n' +
            '  ' + styles + '\n' +
            '  ' + body + '\n' +
        '</office:document>';

    console.log(xmlDoc);
    return xmlDoc;
}
