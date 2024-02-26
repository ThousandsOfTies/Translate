class SpeechSynthesiser {
    constructor(list_element) {
        this.list_element = list_element;
        speechSynthesis.addEventListener('voiceschanged', ev => {
            this.updateVoiceSelect();
        });
        this.voice = {};
    }
    setVoice(name) {
        let voice = speechSynthesis.getVoices().filter(voice => voice.name === name)[0];
        this.voice = voice;
    }
    cancel() {
        speechSynthesis.cancel();
    }
    speak(text) {
        const uttr = new SpeechSynthesisUtterance(text);
        uttr.voice = this.voice;
        speechSynthesis.speak(uttr);
    }
    idle() {
        let busy = speechSynthesis.speaking || speechSynthesis.pending;
        return !busy;
    }
    updateVoiceSelect() {
        const voices = speechSynthesis.getVoices();
        let voice_list = this.list_element;
        let name = voice_list.value;
        voice_list.innerHTML = '';
        let matched_voices = [];
        voices.forEach(v => {
            if (!v.lang.match('en-US')) {
                return;
            }
            const option = document.createElement('option');
            option.value = v.name;
            option.text = `${v.name} (${v.lang});`;
            option.setAttribute('selected', v.default);
            voice_list.appendChild(option);
            matched_voices.push(v);
        });
        let persons = ["Ana", "Aria"];
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
        }
        for (let i = 0; i < voice_list.options.length; i++) {
            if (voice_list.options[i].value == name) {
                console.log("selected = " + name);
                voice_list.options[i].selected = true;
            }
        }
        let arg = voice_list.options[voice_list.selectedIndex].value;
        this.setVoice(arg);
    }
}
