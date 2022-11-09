// ==UserScript==
// @name     litSnatch
// @version  1
// @grant    none
// @include  https://litnet.com/*
// ==/UserScript==
(async () => {
  
    const getPartFrom = (s, an) => {
        return s.slice(s.lastIndexOf(an) + 1);
    }

    const delay = async () => {
        console.log('waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
	
		const pause = async () => {
        console.log('pause...');
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const getPageBody = () => {
        const header = $('div.reader-text h2').html();
        const wrappedHeader = header ? `<h2>${header}</h2>` : '';

        const body = $('div.reader-text .jsReaderText').html();
        let trimmedBody = body;
        trimmedBody = trimmedBody.slice(0, trimmedBody.lastIndexOf('<link'));
        trimmedBody = trimmedBody.slice(0, trimmedBody.lastIndexOf('<div class="block b-recommended'));

        return wrappedHeader + trimmedBody;
    }

    const saveText = (text) => {
        const data = new Blob([text], {type: 'text/plain'});
        const url = window.URL.createObjectURL(data);
        const fakeAnchor = document.createElement('a');

        const bookname = getPartFrom(location.pathname, '/');
        const chapterId = getPartFrom(location.search, '=');
        const filename = `${bookname}_${chapterId}.html`;
        console.log(`saving to: ${filename}`);
        fakeAnchor.setAttribute('download', filename);
        fakeAnchor.href = url; 
        fakeAnchor.click();
    }

    const getButtonNext = () => {
        const result =  $('.reader-pagination a.pull-right').first();
        return result;
    }

    const isLastPageOfChapter = () => {
        const button = getButtonNext();
        const result = button.hasClass('chapter-btn') || button.size() == 0;
        return result;
    }

    const nextPage = () => {
        getButtonNext().click();
    }

    const nextChapter = () => {
        const href = getButtonNext().attr('href');
        location.assign(href);
    }

    const isEndOfBook = () => {
        return getButtonNext().size() == 0;
    }
    
    if ((!!localStorage.getItem('stopProcessing')))) {
				console.log("No actions");
				return;
    }

    try {
        const pages = [];
        var $ = unsafeWindow.jQuery;
        console.log('do');

        let prevPageBody = '';
        let pageCount = 1;
        do {
            if ((!!localStorage.getItem('stopProcessing')) || (!!unsafeWindow['stopProcessing'])) {
                break;
            }
            
            //const pageLabel = `<p style="text-align: center">${pageCount}</p>`;
            console.log(`page ${pageCount}`);
            
            await delay();
            const pageBody = getPageBody();
            if (prevPageBody === pageBody) {
                await pause();
                location.reload();

            }
            
            //pages.push(pageLabel + pageBody);
						pages.push(pageBody);
            prevPageBody = pageBody;
            if (isLastPageOfChapter()) {
                console.log('Last page of chapter reached');
                break;
            }

            pageCount++;
            nextPage();
        } while(true);

        const chapterText = pages.join('');
        saveText(chapterText);
        await delay();

        if (isEndOfBook()) {
            alert('Готово!');
        } else {
            nextChapter();
        }
    } catch(e){
        console.error(e);
        await pause();
        location.reload();
    }
  
})();