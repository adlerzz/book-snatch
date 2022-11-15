window.CBS = (() => {
    const test = () => {
        console.log('test called');
    }

    const cssUrl = 'https://raw.githubusercontent.com/adlerzz/book-snatch/main/src/bs-controller.css';

    const cssLoad = async () => {
    
        const CSS_RAW = await new Promise( (resolve, reject) => GM.xmlHttpRequest({
            'method': 'GET',
            'url': cssUrl,
            'onload': (resp) => resolve(resp.response),
            'onerror': (error) => reject(error)
        }));
        
    
        $('head').append(`<style>${CSS_RAW}</style>`);
    }
    
    const renderControlPad = async (start, stop) => {
        await cssLoad();

        const ctrl = $(`<div class="bs-controller">
            <div class="bs-controller__row">
                <label class="bs-controller__label">BookSnatch control pad</label>
            </div>
            <div class="bs-controller__row">
                <div class="bs-controller__pad">
            </div>
        </div>`);
        
        $('body').append(ctrl);
        
        
        const pad = $('.bs-controller__pad');
        
        const buttonStart = $('<button class="bs-controller__button">Start</button>');
        buttonStart.click(() => {start()});
        pad.append(buttonStart);
        
        
        const buttonStop = $('<button class="bs-controller__button">Stop</button>');
        buttonStop.click(() => {stop()});
        pad.append(buttonStop);
    };

    const saveText = (text, filename) => {
        const data = new Blob([text], {type: 'text/plain'});
        const url = window.URL.createObjectURL(data);
        const fakeAnchor = document.createElement('a');

        console.log(`saving to: ${filename}`);
        fakeAnchor.setAttribute('download', filename);
        fakeAnchor.href = url; 
        fakeAnchor.click();
    }


    return ({
        test, renderControlPad, saveText
    })
})();