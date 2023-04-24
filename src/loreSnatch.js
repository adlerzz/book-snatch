// ==UserScript==
// @name     loreSnatch
// @version  1
// @grant    none
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @include  http://loveread.ec/*
// ==/UserScript==

(async () => {

    const RUN_KEY = 'run';

    const $ = jQuery;

    const delay = async (duration) => {
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    const saveText = (text, filename) => {
        const data = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(data);
        const fakeAnchor = document.createElement('a');

        console.log(`saving to: ${filename}`);
        fakeAnchor.setAttribute('download', filename);
        fakeAnchor.href = url;
        fakeAnchor.click();
    }

    const controlsRender = (actions) => {
        const [doStart, doStop] = actions;
        const ctrl = $('<div id="controller"/>');
        ctrl.css({
            'position': 'fixed',
            'height': '30px',
            'width': '200px',
            'top': '50px',
            'left': '20px',
            'background-color': 'gray',
            'z-index': '2000000001'
        });

        const buttonStart = $('<button id="start">Start</button>');
        buttonStart.click(() => { doStart() });
        ctrl.append(buttonStart);


        const buttonStop = $('<button id="Stop">Stop</button>');
        buttonStop.click(() => { doStop() });
        ctrl.append(buttonStop);

        $('body').append(ctrl);
    }

    const nextChapter = () => {
        const link = $('.navigation > *').last();
        return link.is('a') ? link.attr('href') : null;
    }

    const extractText = () => {
        const allTextElements = $('div.MsoNormal').find('p.MsoNormal,div.take_h1');
        return [...allTextElements].map((el) => el.outerHTML).join('');
    }

    const extractChapter = () => {
        return location.search.slice(1) + '.html';
    }

    const iteration = async () => {
        const run = JSON.parse(localStorage.getItem(RUN_KEY));
        if (!run) {
            return;
        }
        await delay(500);
        const text = extractText();
        saveText(extractText(), extractChapter());
        await delay(500);
        const next = nextChapter();
        if (next) {
            location.assign(next);
        }
    }

    const doStart = async () => {
        localStorage.setItem(RUN_KEY, true);
        await iteration();

    }

    const doStop = () => {
        localStorage.removeItem(RUN_KEY);
    }


    controlsRender([doStart, doStop]);

    await iteration();

})();
