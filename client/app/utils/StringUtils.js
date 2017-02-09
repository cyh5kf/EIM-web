import _ from 'underscore';
import React from 'react';
import createFragment from 'react-addons-create-fragment';

const emailReg = /((([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))/gi;
const httpReg = /((https?:\/\/)?([\w-]+\.)+[\w-]+(\/?[\w- ./?%&=]*))/gi;
const imgReg = /((^https?:\/\/)?[^'"<>]+?\.(jpg|jpeg|gif|png))/gi;
const atReg = /(<@([UG]{0,1})([A-Z0-9]+|Session)>)/g;

const placeholder = document.createElement('span');

export default {
    //format("{0} xx {1}", "100", "fuck")
    format: function(pattern) {
        var params = Array.prototype.slice.call(arguments);
        params.shift();

        if (pattern == null) {
            console.warn("null pattern in StringUtils.format()");
            return "";
        }
        var len = params.length;
        for (var i = 0; len > i; i++) {
            pattern = pattern.split("{" + i + "}").join(params[i]);
        }
        return pattern;
    },
    // format("{0:this is part one} xxx {1:this is part two} {2}", renderPartOne, renderPartTwo, renderPartThree) => ReactNode
    // E.g.
    //    format("{0:this is part one} xxx {1:this is part two}{2}", (text) => <span className="first">{text}</span>, (text) => <p>{text}</p>, (text) => <b>{text}</b>)
    // => [ <span className="first">this is part one</span>, <span> xxx </span>, <p>this is part two</p>, <b></b>]
    formatAsReact: function(pattern, ...renders) {
        const results = [];
        renders.forEach((render, idx) => {
            const reg = new RegExp('\{' + idx + '((:([^\}]+))|)\}'),
                matched = pattern.match(reg);
            if (matched) {
                const innerText = matched[3];
                const [leftPart, rightPart] = pattern.split(matched[0]);
                results.push(
                    <span>{leftPart}</span>,
                    render(innerText)
                );
                pattern = rightPart;
            }
        });
        if (pattern) {
            results.push(<span>{pattern}</span>);
        }
        return createFragment(results.reduce((map, node, idx) => _.assign(map, {
            ['key-' + idx]: node
        }), {}));
    },

    atMatches: function(text) {
        return text.match(atReg);
    },

    getMentionIdentify: function(text) {
        return text.replace(atReg, '$3');
    },
    classifyMention: function(text) {
        return text.replace(atReg, '$2');
    },

    convertMailToLink: function(html) {
        if (html.indexOf('@') > -1) {
            return html.replace(emailReg, '<a href="mailto:$1">$1</a>');
        }
        return html;
    },

    convertImageLink: function(html, alt) {
        return html.replace(imgReg, '<img src="$1" alt="' + alt + '" />');
    },

    emailMatches: function(html) {
        return html.match(emailReg);
    },

    imageMatches: function(html) {
        return html.match(imgReg);
    },

    convertURLToLink: function(html) {
        return html.replace(httpReg, '<a href="$1" target="_blank">$1</a>');
    },

    htmlToText(html) {
        placeholder.innerHTML = html;
        return placeholder.textContent || placeholder.innerText || '';
    }
}
