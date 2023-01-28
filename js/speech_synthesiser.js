class SpeechSynthesiser {
    constructor(list_id) {
        this.list_id = list_id;
        speechSynthesis.addEventListener('voiceschanged', ev => {
            this.updateVoiceSelect();
        });
        this.voice = {};
    }
    setVoice(name) {
        let voice = speechSynthesis.getVoices().filter(voice => voice.name === name)[0];
        this.voice = voice;
    }
    speak(text) {
        const uttr = new SpeechSynthesisUtterance(text);
        uttr.voice = this.voice;
        speechSynthesis.speak(uttr);
    }
    updateVoiceSelect() {
        const voices = speechSynthesis.getVoices();
        let elm = document.querySelector('#' + this.list_id);
        let name = elm.value;
        elm.innerHTML = '';

        let matched_voices = [];
        voices.forEach(v => {
            if (!v.lang.match('en-US')) {
                return;
            }
            const option = document.createElement('option');
            option.value = v.name;
            option.text = `${v.name} (${v.lang});`;
            option.setAttribute('selected', v.default);
            elm.appendChild(option);
            matched_voices.push(v);
        });
        let persons = ["Aria", "Ana"];
        persons.some(person => {
            matched_voices.some(v => {
                if (v.name.match(person)) {
                    name = v.name;
                    return true;
                }
            });
            if (name != "") {
                return true;
            }
        });
        if (name == "" || name == undefined) {
            name = matched_voices.at(-1).name;
            console.log("updated name = " + name);
        }
        for ( let i = 0; i < elm.options.length; i++) {
            if (elm.options[i].value == name) {
                console.log("selected = " + name);
                elm.options[i].selected = true;
            }
        }
        let arg = elm.options[elm.selectedIndex].value;
        this.setVoice(arg);
    }
}
