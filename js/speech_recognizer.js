class SpeechRecognizer {
    constructor(recpause_btn_id, onResult) {
        this.STOP_TEXT = 'STOP';
        this.REC_TEXT = 'REC';
        this.recpause_btn_id = recpause_btn_id;
        document.querySelector('#' + this.recpause_btn_id).value = this.REC_TEXT;
        this.onResult = onResult;

        let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.addEventListener('result', (ev) => {
            var text;
            for (var i = ev.resultIndex; i < ev.results.length; i++) {
                var result = ev.results.item(i);
                if (result.final === true || result.isFinal === true) {
                    text = result.item(0).transcript;
                }
            }
            this.onResult(text);
        });
        this.stop_from_recpause_btn = false;
        this.recognition.addEventListener('start', (ev) => {
            document.querySelector('#' + this.recpause_btn_id).value = this.STOP_TEXT;
        });
        this.recognition.addEventListener('end', (ev) => {
            if (this.stop_from_recpause_btn == false) {
                this.recognition.start();
                return;
            }
            document.querySelector('#' + this.recpause_btn_id).value = this.REC_TEXT;
        });
        document.querySelector('#' + this.recpause_btn_id).addEventListener('click', (ev) => {
            if (ev.currentTarget.value == this.STOP_TEXT) {
                this.stop_from_recpause_btn = true;
                this.recognition.stop();
            } else if (ev.currentTarget.value == this.REC_TEXT) {
                this.recognition.start();
            }
        });

    }
}

