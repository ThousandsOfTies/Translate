class ChatTable {
    constructor(working_root_element, cols) {
        let CHAT_TABLE_CLASS   = 'chat_table';
        this.cols = cols;

        let hd = '<tr>';
        this.cols.forEach( (col) => {
            hd += '<th>' + col + '</th>';
        });
        hd += '</tr>';
        working_root_element.insertAdjacentHTML('beforeend', '<table class="' + CHAT_TABLE_CLASS + '">' + hd + '</table>');
        this.chat_table_element = working_root_element.querySelector("." + CHAT_TABLE_CLASS);
    }

    appendRow(col, msg) {
        let r = this.chat_table_element.insertRow(1);
        this.cols.forEach( (col) => {
            r.insertCell();
        });
        r.cells[col].innerHTML = msg;
    }
}

class ChatWithChatGPT {
    constructor(api_key, working_root_element, onResponse) {
        this.api_key = api_key;
        this.onResponse = onResponse;
        this.chat_table = new ChatTable(working_root_element, ["Others", "Yours"]);

    }

    chat(statement) {
        this.chat_table.appendRow(1, statement);
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.api_key
            },
            body: JSON.stringify({
                'model':'gpt-3.5-turbo',
                'messages' : [
                    {'role':'system', 'content': 'answer friendly within about 15 words.'},
                    {'role':'user', 'content': statement }
                ]
            })
        })
        .then(res => {
            return res.json();
        })
        .then(eng => {
            var content = eng.choices[0].message.content
            this.chat_table.appendRow(0, content);
            this.onResponse(content);
            return;
        });
    }
}
