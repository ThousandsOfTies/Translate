class SpeechRecognizer {
    constructor(recpause_btn_element, onResult) {
        this.STOP_TEXT = 'STOP';
        this.REC_TEXT = 'REC';
        this.recpause_btn_element = recpause_btn_element;
        this.recpause_btn_element.value = this.REC_TEXT;
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
        this.intensional_stop = false;
        this.recognition.addEventListener('start', (ev) => {
            this.recpause_btn_element.value = this.STOP_TEXT;
        });
        this.recognition.addEventListener('end', (ev) => {
            if (this.intensional_stop == false) {
                this.recognition.start();
                return;
            }
            this.recpause_btn_element.value = this.REC_TEXT;
        });
        this.recpause_btn_element.addEventListener('click', (ev) => {
            if (ev.currentTarget.value == this.STOP_TEXT) {
                this.recognition.stop();
            } else if (ev.currentTarget.value == this.REC_TEXT) {
                this.recognition.start();
            }
        });
    }
    start(){
        this.recognition.start();
    }
    stop(){
        this.intensional_stop = true;
        this.recognition.stop();
    }
}

