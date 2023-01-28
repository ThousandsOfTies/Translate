class WordImage extends HTMLImageElement {
    static {
        customElements.define('word-image', WordImage, { extends: 'img' });
    }
    constructor(src, text, posi) {
        super();
        this.src = src;
        this.setAttribute('class', 'draggable_img word');
        this.setAttribute('draggable', 'false');
        this.setAttribute('data-text', text);
        this.setAttribute('data-posi', posi);
    }
}

class DraggableBox extends HTMLDivElement {
    static {
        customElements.define('draggable-box', DraggableBox, { extends: 'div' });
    }
    constructor(icon_list, speak_func) {
        super();
        this.setAttribute('class', 'draggable_box');
        this.setAttribute('draggable', 'false');

        this.icon_list = icon_list;
        this.dataset.selected = icon_list[0].src;
        this.dataset.text = this.icon_list[0].text;
        this.dataset.posi = this.icon_list[0].posi;

        this.speak_func = speak_func;

        this.addEventListener('mousedown', function (ev) {  // function(ev)を(ev) =>にすると、thisがwindowオブジェクトになってしまう。
            if (ev.button != 0) {
                return;
            }
            this.press(ev);
        });
        this.addEventListener('mousemove', function (ev) {
            if (this.classList.contains('holding') == false) {  // 要素をクリックしていなくても上を通るだけでイベントが来るため、holding時以外は移動を行わない。
                return;
            }
            if (this.classList.contains('expanded') == true) {  // アイコンの候補を出して選んでいるときは要素の移動を行わない。
                return;
            }
            this.speak = false;
            this.delayedExpand(true);
            let style = getComputedStyle(this);
            this.style.top = (parseInt(style.top, 10) + ev.movementY) + 'px';
            this.style.left = (parseInt(style.left, 10) + ev.movementX) + 'px';
        });
        this.addEventListener('mouseup', function (ev) {  // function(ev)を(ev) =>にすると、thisがwindowオブジェクトになってしまう。
            if (ev.button != 0) {
                return;
            }
            this.release();
            ev.stopPropagation();
        });
        this.addEventListener('mouseleave', function (ev) {
            if (this != ev.target) {
                return;
            }
            this.release();
        });

        // taouch panel用
        this.addEventListener('touchstart', function (ev) {
            ev.preventDefault();  // これがないと不要なmousedown, mouseup, clickが発生してしまう。
            this.prevX = ev.touches[0].clientX;
            this.prevY = ev.touches[0].clientY;
            this.press(ev);
        });
        this.addEventListener("touchmove", function (ev) {
            if (this.classList.contains('holding') == false) {
                return;
            }
            if (this.classList.contains('expanded') == true) {  // アイコンの候補を出して選んでいるときを表す。
                return;
            }
            this.speak = false;
            this.delayedExpand(true);
            let x = ev.touches[0].clientX - this.prevX;
            let y = ev.touches[0].clientY - this.prevY;
            this.prevX = ev.touches[0].clientX;
            this.prevY = ev.touches[0].clientY;
            let style = getComputedStyle(this);
            this.style.top = (parseInt(style.top, 10) + y) + "px";
            this.style.left = (parseInt(style.left, 10) + x) + "px";
        });
        this.addEventListener('touchend', function (ev) {
            this.release();
            ev.stopPropagation();
        });
        this.collapse();
    }

    press(ev) {
        if (this.classList.contains('expanded') == true) {  // アイコンの候補を出して選んでいるときを表す。
            if (ev.target.src) {
                let icon = this.icon_list.filter(icon => ev.target.src.endsWith(icon.src));
                this.dataset.selected = icon[0].src;
                this.dataset.text = icon[0].text;
                this.dataset.posi = icon[0].posi;
                this.speak = false;
                this.collapse();
                return;
            }
        }
        this.classList.add("holding");
        this.speak = true;
        this.delayedExpand(true);
    }
    move(x, y) {

    }
    release() {
        this.classList.remove("holding");
        this.delayedExpand(false);
        if (this.classList.contains('expanded') == true) {
            return;
        }
        if (this.speak) {
            this.speak = false;
            this.speak_func(this.dataset.text);
        }
    }
    expand() {
        let icon_list = this.icon_list.filter(icon => icon.src != this.dataset.selected);
        icon_list.forEach((icon, index, ar) => {
            let img = new WordImage(icon.src, icon.text, icon.posi);
            if (index % Math.floor(Math.sqrt(ar.length) + 1) == 0) {
                this.appendChild(document.createElement('br'));
            }
            this.appendChild(img);
        });
        this.classList.add('expanded');
    }
    collapse() {
        while (this.lastChild) {
            this.removeChild(this.lastChild);
        }
        this.appendChild(new WordImage(this.dataset.selected, this.dataset.text, this.dataset.posi));
        this.classList.remove('expanded');
    }
    delayedExpand(flag) {
        if (this.tid != undefined) {
            clearTimeout(this.tid);
            delete this.tid;
        }
        if (flag) {
            this.old_style = getComputedStyle(this);
            this.tid = setTimeout(() => {
                let style = getComputedStyle(this);
                if (style.top == this.old_style.top && style.left == this.old_style.left && this.classList.contains('expanded') == false) {
                    this.expand();
                }
            }, 300);
        }
    }
}

class FlickableIconsTranslater {
    constructor(working_root_id, speak_func) {
        this.working_root_id = working_root_id;
        this.statemenmt_tray_class = 'statemenmt_tray';
        this.words_tray_class = 'words_tray';
        this.word_class = 'word';
        this.speak_func = speak_func;
        this.prevX = 0;
        this.prevY = 0;
        this.makeWorkPlace();
    }
    speakInEng(words) {
        document.querySelector('#' + this.working_root_id + ' .words').textContent = words;
        document.querySelector('#' + this.working_root_id + ' .eng').textContent = '英語化中';
        fetch('https://script.google.com/macros/s/AKfycbzaYhG3i8Q8G-jp0t5DK04qAe7v11od6WVdcNtkvrR6a58b4CbBSgdWmW4QWZ4kFM3l/exec?translate="' + words + '"&source=ja&target=en')
            .then(res => {
                return res.json();
            })
            .then(eng => {
                document.querySelector('#' + this.working_root_id + ' .eng').textContent = eng;
                this.speak_func(eng);
                return;
            });
    }
    makeWorkPlace() {
        let root = document.querySelector('#' + this.working_root_id);
        root.insertAdjacentHTML('beforeend', '<div class="' + this.statemenmt_tray_class + ' tray"></div>');
        root.insertAdjacentHTML('beforeend', '<table><tr><td><div class="words">{入力}</div></td><td>⇒</td><td><div class="eng">{英語}</div></td></tr></table>');
        root.insertAdjacentHTML('beforeend', '<div class="' + this.words_tray_class + ' tray parent"></div>');

        let p = document.createElement("div");
        p.classList.add("parent");
        (async () => {
            let sub_dir_paths = [];
            const response = await fetch("./icon/");
            const text = await response.text();
            const icon_dir_dom = new DOMParser().parseFromString(text, "text/html");
            icon_dir_dom.querySelectorAll("a").forEach((a) => {
                sub_dir_paths.push(a.pathname);
            });
            sub_dir_paths.sort(function (a, b) {
                if (a < b) return -1;
                if (a > b) return 1;
                if (a === b) return 0;
            });
            let sub_dir_promises = sub_dir_paths.map(async (sub_dir_path) => {
                let res = await fetch(sub_dir_path);
                let sub_dir_text = await res.text();
                let sub_dir_dom = new DOMParser().parseFromString(sub_dir_text, "text/html");
                var attr_path = '';
                var png_paths = [];
                var entries = sub_dir_dom.querySelectorAll("a");
                entries.forEach((entry) => {
                    if (entry.pathname.match(/.*\/attribute.json/)) {
                        attr_path = entry.pathname;
                    } else if (entry.pathname.match(/.*\.png/)) {
                        png_paths.push(entry.pathname);
                    }
                });

                if (attr_path == '') {
                    return {'posi':'', 'png_paths':[]};
                }
                let attr_res = await fetch(attr_path);
                let attr_json = await attr_res.json();
                let ret = { 'posi': attr_json['posi'], 'png_paths': png_paths };
                return ret;
            })
            Promise.all(sub_dir_promises).then(sub_dir_entries => {
                sub_dir_entries.forEach(sub_dir_entry => {
                    var icon_list = [];
                    if (sub_dir_entry.png_paths == undefined) {
                        return;
                    }
                    if (sub_dir_entry.png_paths.length == 0) {
                        return;
                    }
                    sub_dir_entry.png_paths.forEach(png_path => {
                        const path = png_path;
                        const text = decodeURI(png_path.replace(/.*\//, '').replace(/\.png/, '').replace(/^\d*_/, ''));
                        icon_list.push({ "src": path, "text": text, "posi": sub_dir_entry.posi });
                    });

                    let c = document.createElement("div");
                    c.classList.add("child");
                    if (icon_list[0].posi == 'w') {
                        c.appendChild(new DraggableBox([icon_list[0]], text => this.speakInEng(text)));
                        p.appendChild(c);
                        c.appendChild(new DraggableBox(icon_list.slice(1), text => this.speakInEng(text)));
                        p.appendChild(c);
                    } else {
                        for (let i = 0; i< 2; i++) {
                            c.appendChild(new DraggableBox(icon_list, text => this.speakInEng(text)));
                            p.appendChild(c);
                        }
                    }
                });
            });
        })();

        document.querySelector('#' + this.working_root_id + ' .' + this.words_tray_class).appendChild(p);
        document.querySelector('#' + this.working_root_id + ' .' + this.statemenmt_tray_class).addEventListener('click', e => {
            let cr = e.target.getBoundingClientRect();

            let tlx = window.pageXOffset + cr.left;
            let tly = window.pageYOffset + cr.top;
            let brx = tlx + cr.width;
            let bry = tly + cr.height;

            let words_on_tray = [];
            document.querySelectorAll('#' + this.working_root_id + ' .' + this.word_class).forEach(word => {
                let cr = word.getBoundingClientRect();
                let left = window.pageXOffset + cr.left;
                let top = window.pageYOffset + cr.top;
                if (bry < top) {
                    return;
                }
                words_on_tray.push(word);
            });
            let statement = '';
            words_on_tray.sort(function (x, y) {
                if (x.getBoundingClientRect().left < y.getBoundingClientRect().left) return -1;
                if (y.getBoundingClientRect().left < x.getBoundingClientRect().left) return 1;
                return 0;
            });
            let wr = new WordsReorderer();
            let reordered_words = wr.exec(words_on_tray);
            reordered_words.forEach(word => {
                statement = statement + word + ' ';
            });
            statement = statement + "。";

            this.speakInEng(statement);
        });
    }
}
