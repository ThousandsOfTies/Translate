class WordsReorderer {
    constructor() {
    }
    exec(words) {
        let ret = [];
        let interrogative_words = [];
        let subjects = [];
        let verbs = [];
        let etc = [];
        let question_word = '';
        let postpositional_particle = '';

        words.forEach( word => {
            if (word.dataset.posi.includes('w') && word.dataset.text == '◯か✕') {
                question_word = 'のか？'
            } else if (word.dataset.posi.includes('w') && word.dataset.text != '不明箇所') {
                interrogative_words.push(word);
                question_word = 'のか？'
            } else if (word.dataset.posi.includes('v') || word.dataset.posi.includes('v2')) {
                verbs.push(word);
            } else if (verbs.length==0) {
                if (word.dataset.text == '不明箇所') {
                    postpositional_particle = "が"
                } else {
                    subjects.push(word);
                }
            } else {
                if (word.dataset.text == '不明箇所') {
                    postpositional_particle = "を"
                } else {
                    etc.push(word);
                }
            }
            word.getBoundingClientRect();
        });

        interrogative_words.forEach(value => {
            ret.push(value.dataset.text);
            ret.push(postpositional_particle);
        });

        postpositional_particle = "";
        subjects.forEach((value, index, array) => {
            if (index > 0) {
                let pright = array[index-1].getBoundingClientRect().right;
                let cleft = value.getBoundingClientRect().left;
                if ( cleft - pright < 0 ) {
                    ret.push("の");
                } else if ( cleft - pright < 15 ) {
                    ret.push("と");
                }
            }
            ret.push(value.dataset.text);
            postpositional_particle = "は"
        });
        if (postpositional_particle != "") {
            ret.push(postpositional_particle);
        }

        let additoinal_block = [];
        for (let index = 0; index < etc.length; index++) {
            if (index > 0) {
                let pright = etc[index-1].getBoundingClientRect().right;
                let cleft  = etc[index  ].getBoundingClientRect().left;
                if ( cleft - pright < 0 ) {
                    ret.push("の");
                } else if ( cleft - pright < 15 ) {
                    ret.push("と");
                } else {
                    additoinal_block = etc.slice(index);
                    break;
                }
            }
            ret.push(etc[index].dataset.text);
        }
        if (etc.length) {
            ret.push("を");
        }

        additoinal_block.forEach(value => {
            ret.push(value.dataset.text);
        });

        verbs.forEach( (value, index, array) => {
            if (index > 0) {
                ret.push("して")
            }
            ret.push(value.dataset.text);
            if (index + 1 == array.length && question_word == '') {
                ret.push("する");
            }
        });

        if (question_word != '') {
            ret.push(question_word);
        }

        return ret;
    }
}
