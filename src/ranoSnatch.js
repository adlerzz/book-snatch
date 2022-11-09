// ==UserScript==
// @name     ranoSnatch
// @version  1
// @grant    none
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @include  https://ranobelib.me/*
// ==/UserScript==
(async() => {
  const $ = jQuery;
  const RUN_KEY = 'run';
  const CHAPTERS_KEY = 'chapters';
  const INDEX_KEY = 'index'
  
  const saveText = (text, filename) => {
    const data = new Blob([text], {type: 'text/plain'});
    const url = window.URL.createObjectURL(data);
    const fakeAnchor = document.createElement('a');

    console.log(`saving to: ${filename}`);
    fakeAnchor.setAttribute('download', filename);
    fakeAnchor.href = url; 
    fakeAnchor.click();
  }
  
  const reduceSpaces = (s, delimiter) => s.trim().replaceAll(/\s+/g, delimiter);
  
  const doSave = async () => {
    const run = JSON.parse(localStorage.getItem('run'));
    if(!run){
      return;
    }
    const chapters = JSON.parse(localStorage.getItem(CHAPTERS_KEY));
    const currentIndex = localStorage.getItem(INDEX_KEY);
    console.log('index: ' + currentIndex);
    const bookName = $('.reader-header-action__text').first().text();
    console.log(bookName);
    const chapterName = chapters[currentIndex].text;
    console.log(chapterName);
    const header = `<h2>${chapterName}</h2>`;
    const body = $('div.reader-container').html();
    const text = header + body;
    const filename = reduceSpaces(`${bookName}_${chapterName}.html`, '_');
    saveText(text, filename);
    await new Promise(resolve => setTimeout(resolve, 500));
    if(currentIndex > 0){
      const nextChapter = currentIndex - 1;
      localStorage.setItem(INDEX_KEY, nextChapter);
      location.assign(chapters[nextChapter].href);
    } else {
    	doStop();
    }
    
  }
  
  const doStop = () => {
    localStorage.removeItem(RUN_KEY);
    localStorage.removeItem(INDEX_KEY);
    localStorage.removeItem(CHAPTERS_KEY);
  }
  
  const doStart = async () => {
    $('.reader-header-actions .reader-header-action[data-reader-modal="chapters"]').click();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const chapters = $('.popup__content .modal__body a.menu__item').map( (i, el) => {
      const a = $(el);
      return ({
        index: i,
        href: a.attr('href'), 
        text: reduceSpaces(a.text(), ' ')
      });
    }).get();
    
    //localStorage.setItem(INDEX_KEY, items.length - 1);
    
    
    
    $('.modal__close').click();
    const currentHref = location.pathname + location.search;
    const currentChapter = chapters.filter( chapter => chapter.href == currentHref).pop();
    
    if(!currentChapter){
      alert('Nope');
      console.log(chapters);
      return;
    }
    console.log(currentChapter);
    const nextChapter = currentChapter.index - 1;
    
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
    localStorage.setItem(RUN_KEY, true);
    localStorage.setItem(INDEX_KEY, nextChapter)
    location.assign(chapters[nextChapter].href);
  }
  
  
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
  buttonStart.click(() => {doStart()});
  ctrl.append(buttonStart);
  
  
  const buttonStop = $('<button id="Stop">Stop</button>');
  buttonStop.click(() => {doStop()});
  ctrl.append(buttonStop);
  
  $('body').append(ctrl);
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  
  await doSave();
  

})();