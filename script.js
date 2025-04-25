(function () {
    function createAnswerBox() {
        const box = document.createElement("div");
        box.id = "answerBox";
        box.style.position = "fixed";
        box.style.top = "10px";
        box.style.right = "10px";
        box.style.backgroundColor = "#fff";
        box.style.border = "2px solid #000";
        box.style.padding = "10px";
        box.style.zIndex = "9999";
        box.style.fontFamily = "Arial, sans-serif";
        box.style.fontSize = "16px";
        box.style.maxWidth = "300px";
        box.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        box.innerHTML = "Svar: Leter...";
        document.body.appendChild(box);
    }

    function extractAndDecodeAnswer() {
        const scripts = document.getElementsByTagName("script");
        let foundAnswer = false;
        const answerBox = document.getElementById("answerBox");
        if (!answerBox) {
            createAnswerBox();
        }
        for (let script of scripts) {
            const text = script.textContent;
            const regex = /atob\('([^']+)'\)/;
            const match = text.match(regex);
            if (match && match[1]) {
                try {
                    const decoded = decodeURIComponent(escape(atob(match[1])));
                    const jsonData = JSON.parse(decoded);
                    let answer = "";
                    const answerData = jsonData.data.answer || {};
                    if (answerData.numbers && answerData.numbers.length > 0) {
                        answer = answerData.numbers[0].number;
                    } else if (answerData.words && answerData.words.length > 0) {
                        answer = typeof answerData.words[0] === "object" ? answerData.words[0].word : answerData.words[0];
                    } else if (answerData.formulas && answerData.formulas.length > 0) {
                        answer = typeof answerData.formulas[0] === "object" ? answerData.formulas[0].formula : answerData.formulas[0];
                    } else if (answerData.input) {
                        answer = answerData.input.replace(/<[^>]+>/g, "").replace(/{n\d+}/g, "").trim();
                    } else if (jsonData.data.alt1 && jsonData.data.answer) {
                        const alts = ["alt1", "alt2", "alt3", "alt4", "alt5"];
                        answer = jsonData.data[alts[parseInt(jsonData.data.answer) - 1]];
                    }
                    if (answer && answerBox) {
                        answerBox.innerHTML = `Svar: <strong>${answer}</strong>`;
                        foundAnswer = true;
                        break;
                    }
                } catch (e) {
                    console.error("Error decoding:", e);
                }
            }
        }
        if (!foundAnswer && answerBox) {
            const tableAnswer = calculateTablePercentage();
            if (tableAnswer) {
                answerBox.innerHTML = `Svar: <strong>${tableAnswer}</strong>`;
                foundAnswer = true;
            }
            if (!foundAnswer) {
                answerBox.innerHTML = "Svar: Fant ingen svar ennå...";
            }
        }
    }

    function calculateTablePercentage() {
        const table = document.querySelector("table");
        if (!table) return null;
        const rows = table.querySelectorAll("tbody tr");
        if (rows.length === 0) return null;
        let data = [],
            total = 0;
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const label = cells[0].textContent.trim(),
                    value = parseInt(cells[1].textContent.trim(), 10);
                if (!isNaN(value)) {
                    data.push({ label, value });
                    total += value;
                }
            }
        });
        if (total === 0) return null;
        const targetLabel = "Juni";
        let targetValue = null;
        data.forEach(item => {
            if (item.label === targetLabel) targetValue = item.value;
        });
        if (targetValue === null) return null;
        return Math.round((targetValue / total) * 100) + "%";
    }

    if (!document.getElementById("answerBox")) {
        createAnswerBox();
    }

    function continuousCheck() {
        extractAndDecodeAnswer();
        setTimeout(continuousCheck, 2000);
    }

    continuousCheck();
})();
