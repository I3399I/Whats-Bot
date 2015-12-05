// ==UserScript==
// @name         WhatsApp Bot
// @namespace    WhatsApp Bot
// @version      2.5 BETA
// @description  A whatsapp web bot
// @author       I3399I
// @match        https://web.whatsapp.com/
// @grant        Thanks for Macr's Warehouse making this good WS send msg method!
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

//Character used to indentify commands
var any = '/';

//Do debug or not
var doDebug = true;

//Msg selectors
var msgTextSelect = '#main > div > div.pane-chat-msgs.pane-chat-body > div.message-list > div:last > div > div > div.message-text > span.emojitext.selectable-text';
var msgTypeSelect = '#main > div > div.pane-chat-msgs.pane-chat-body > div.message-list > div:last';
var msgSubTypeSelect = '#main > div > div.pane-chat-msgs.pane-chat-body > div.message-list > div:last > div';
var msgAuthorSelect = '#main > div > div.pane-chat-msgs.pane-chat-body > div.message-list > div:last > div > div > h3 > span > span.text-clickable > span';

//General vars
var args;
var id;
var lastId;
var msgAuthor;
var msgText;
var version = '2.5 BETA';
var owner = 'Me';

//Var used to detect msgs
var msgTypes = [
    'msg',
    'msg msg-continuation',
    'msg msg-continuation msg-group',
    'msg msg-group'
];

//Emoji used to separate stuff
var block_divider = '➖➖➖➖➖➖\n';

//Get the CMD request
$(document).bind('DOMNodeInserted', function(e) {
    msgBoxType = $(msgTypeSelect).attr('class');
    id = $(msgTextSelect).attr('data-reactid');
    if (isMsg(msgBoxType) && lastId !== id) {
        msgBoxSubType = $(msgSubTypeSelect).attr('class');
        if (msgBoxType == 'msg msg-group' && msgBoxSubType !== 'message message-out' && msgBoxSubType !== 'message message-out tail') {
            msgAuthor = $(msgAuthorSelect).html();
        } else if (msgBoxSubType == 'message message-out tail') {
            msgAuthor = owner;
        }
        console.log(msgAuthor);
        msgText = $(msgTextSelect).html();
        if (stringStartsWith(msgText, any)) {
            debug('Detected a command');
            parseCmd(msgText.toLowerCase());
        }
        lastId = id;
    }
});

//CMD constructor
function cmd(nm, syntax, desc, isOn) {
    this.nm = nm;
    this.syntax = syntax;
    this.desc = desc;
    this.isOn = isOn;
    this.run = function(args) {
        console.log('EXECUTED ' + this.nm + ' IN DEFAULT MODE');
    };
}

//Start of CMD area

//Vars area
var tdareStack = [];
//End of vars area

var about = new cmd('About', '', 'About the Bot', true);
about.run = function(args) {
    send('WhatsApp Bot | Made by I3399I');
    send('Version ' + version);
    send('Source code at: http://bit.ly/l3399l');
};

var countdown = new cmd('Countdown', '[TIMES] [MS]', 'Generates a countdown with custom miliseconds, min delay is 100 ms', true);
countdown.run = function(args) {
    var i = 0;

    if (args.length < 3) {
        syntaxError();
        return;
    }
    var times = parseInt(args[1], 10);
    if (isNaN(times))
        times = 5;
    debug('[COUNTDOWN] Got ' + times + ' times');
    var ms = parseInt(args[2], 10);
    if (isNaN(ms))
        ms = 500;
    ms -= 100;
    if (ms < 100)
        ms = 100;
    debug('[COUNTDOWN] Got ' + ms + ' miliseconds');

    if (times > 10) {
        send('times too high! using 10 times instead!');
        times = 10;
    }

    if (ms > 2000) {
        send('MS too high! using 2000ms instead!');
        ms = 2000;
    }

    send(times);

    loop();

    function loop() {
        setTimeout(function() {
            times--;
            if (times >= 0) {
                send(times);
                loop();
            }
        }, ms);
    }
};

var fact = new cmd('Fact', '[NUMBER]', 'Returns the factorial of a x number', true);
fact.run = function(args) {
    if (args.length > 1 && !isNaN(args[1])) {
        send(factorial(parseInt(args[1], 10)));
    } else
        syntaxError();
};

var help = new cmd('Help', '[CMD]', 'Used for help', true);
help.run = function(args) {
    var found = false;

    for (var i = 0; i < cmds.length; i++) {
        if (args[1].toLowerCase() == cmds[i].nm.toLowerCase()) {
            debug('[HELP CMD] Found ' + args[1] + ' CMD');
            send(cmds[i].nm + '\n' + cmds[i].desc + '\nSyntax: ' + any + cmds[i].nm + ' ' + cmds[i].syntax);
            found = true;
        }
    }

    if (!found)
        send('No CMD with name "' + args[1] + '" found, use\n' + any + 'list to see all the CMDs');
};

var list = new cmd('List', '', 'Lists all the CMDs avaible', true);
list.run = function(args) {
    var msg = '';
    msg = msg.concat('\tAvaible CMDs\n');
    msg = msg.concat(block_divider);
    for (var i = 0; i < cmds.length; i++) {
        msg = msg.concat('\t' + any + cmds[i].nm + '\n');
    }
    msg = msg.concat(block_divider);
    send(msg);
    send('Use ' + any + 'help [CMD] for info');
};

var say = new cmd('Say', '[msg]', 'A CMD that makes me say something', true);
say.run = function(args) {
    args[0] = '';
    send(args.join(' '));
};

var tadd = new cmd('TAdd', '[NAME]', 'Adds a person to tdare CMD', true);
tadd.run = function(args) {
    if (args.length < 2) {
        syntaxError();
        return;
    }
    args[0] = '';
    var p = args.join(' ').substring(1);

    tdareStack[tdareStack.length] = p;
    send('Added ' + p + ' person to tdareStack');
};

var tdare = new cmd('TDare', 'set [truth|dare|both]', 'Truth or Dare CMD, generates random results or Use ' + any + 'tdare set [MODE] to change the mode.', true);
tdare.mode = 'both';
tdare.run = function(args) {
    if (args.length > 2) {
        if (args[1] == 'set') {
            switch (args[2]) {
                case 'truth':
                    this.mode = 'truth';
                    send('Set Truth or Dare mode to only truth');
                    break;
                case 'dare':
                    this.mode = 'dare';
                    send('Set Truth or Dare mode to only dare');
                    break;
                case 'both':
                    this.mode = 'both';
                    send('Set Truth or Dare mode to both');
                    break;
                default:
                    send('Invalid mode!');
                    break;
            }
        }
    } else {
        if (tdareStack.length < 2) {
            send('Error! At least 2 people need to be added! Used /tadd to add them');
            return;
        }
        var td = rand(0, 2);
        var nb1 = rand(0, tdareStack.length);
        var nb2 = rand(0, tdareStack.length);
        var msg;

        for (var i = 0; i < 10; i++) {
            if (nb1 !== nb2) {
                break;
            }
            nb1 = rand(0, tdareStack.length);
            nb2 = rand(0, tdareStack.length);
            debug('[TDARE] Looped for rand');
        }
        debug('[TDARE] Got ' + nb1 + ' index for first person');
        debug('[TDARE] Got ' + nb2 + ' index for first person');

        switch (this.mode) {
            case 'truth':
                send(tdareStack[nb1] + ' asks ' + tdareStack[nb2]);
                break;
            case 'dare':
                send(tdareStack[nb1] + ' dares ' + tdareStack[nb2]);
                break;
            case 'both':
                msg = td > 0 ? ' asks ' : ' dares ';
                send(tdareStack[nb1] + msg + tdareStack[nb2]);
                break;
            default:
                debug('[TDARE] ERROR! Invalid mode!');
                break;
        }
    }
};

var tlist = new cmd('TList', '', 'Lists all the persons from tdare CMD', true);
tlist.run = function(args) {
    var msg = '';
    msg = msg.concat('TdareStack List\n');
    msg = msg.concat(block_divider);
    for (var i = 0; i < tdareStack.length; i++) {
        msg = msg.concat('\t' + tdareStack[i] + '\n');
    }
    msg = msg.concat(block_divider);
    send(msg);
};

var trmv = new cmd('TRmv', '[NAME]', 'Removes a person from tdare CMD', true);
trmv.run = function(args) {
    if (args.length < 2) {
        syntaxError();
        return;
    }
    args[0] = '';
    var p = args.join(' ').substring(1);

    var index = tdareStack.indexOf(p);

    debug(['[TRMV] Got ' + index + ' index']);

    if (index > -1) {
        tdareStack.splice(index, 1);
        send('Removed ' + p + ' from tdareStack');
    } else
        send('No person with name ' + p + ' found');
};

var whoami = new cmd('WhoAmI', '', 'Returns who are you', true);
whoami.run = function(args) {
    send('You are ' + msgAuthor);
};

var wolfr = new cmd('Wolfr', '[INPUT]', 'Generates a page for WolframAlpha© with any input', true);
wolfr.run = function(args) {
    args[0] = '';
    var input = args.join(' ');
    input = input.slice(1, input.length);
    var link = 'http://www.wolframalpha.com/input/?i=';
    send(link + encodeURIComponent(input));
};

//All the CMDs, used for listing/searching
var cmds = [
    about,
    countdown,
    fact,
    help,
    list,
    say,
    tadd,
    tdare,
    tlist,
    trmv,
    wolfr,
    whoami
];

//End of CMD area

//Parse the CMDs
function parseCmd(msg) {
    msg = msg.slice(1, msg.length);
    debug('Got "' + msg + '" CMD request.');
    args = msg.split(' ');
    for (var i = 0; i < cmds.length; i++) {
        if (args[0] == cmds[i].nm.toLowerCase()) {
            if (cmds[i].isOn) {
                debug('Executed ' + cmds[i].nm + ' CMD');
                cmds[i].run(args);
                break;
            } else {
                debug(cmds[i].nm + ' is not enabled!');
                send(cmds[i].nm + ' is not enabled!');
                break;
            }
        }
    };
}

//Utils area

function debug(msg) {
    if (doDebug)
        console.log('[DEBUG]  ' + msg + '\n');
}

function factorial(x) {
    if (x <= 1)
        return 1;
    else
        return x * factorial(x - 1);
}

function isMsg(type) {
    found = false;
    for (var i = 0; i < msgTypes.length; i++) {
        if (type === msgTypes[i]) {
            found = true;
        }
    }
    return found;
}

//Based on http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

//By: http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
function stringStartsWith(string, prefix) {
    return string.slice(0, prefix.length) == prefix;
}

function syntaxError() {
    debug('Syntax Error!');
    send('Invalid syntax! Use\n' + any + 'help [CMD] to see how to use!');
}

//End of utils area

//Send msgs

//Based on http://macr1408.260mb.org/wspam2.html
function dispatch(target, eventType, msg) {
    var evt = document.createEvent('TextEvent');
    evt.initTextEvent(eventType, true, true, window, msg, 0, 'en-US');
    target.focus();
    target.dispatchEvent(evt);
}

function send(msg) {
    setTimeout(function() {
        spam(msg);
    }, 100);
}

//Based on http://macr1408.260mb.org/wspam2.html
function spam(msg) {
    texto = msg;
    campo = document.getElementsByClassName('input')[1];
    dispatch(campo, 'textInput', texto);
    var input = document.getElementsByClassName('icon btn-icon icon-send');
    input[0].click();
    setTimeout(function() {}, 50);
}

//End of send msgs