const files = {
    "gp1_220.json": 10,
    "ngoai966_1438.json": 10,
    "nhi1736_2028.json": 10,
    "san1439_1735.json": 10,
    "sl221_495.json": 10,
    "noi496_965.json": 20
};

const questionsContainer = document.getElementById("questions-container");
const googleSheetsURL ='https://script.google.com/macros/s/AKfycbyocQCX9hkmdzkpyGcgpThpgnzplnlu159nLFFqHk6MGYV9fPCXoEJcOjMzFyIkh1azZA/exec';

async function loadQuestions() {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');

    let dapAn;
    let questions;

    try {
        dapAn = await fetch('json/da.json').then(res => res.json());

        if (subjectParam === 'random') {
            questions = [];

            for (const [file, numQuestions] of Object.entries(files)) {
                const data = await fetch(`json/${file}`).then(res => res.json());
                const keys = Object.keys(data);
                const randomKeys = getRandomKeys(keys, numQuestions);
                questions.push(...randomKeys.map(key => ({ ...data[key], id: key })));
            }
        } else {
            const data = await fetch(`json/${subjectParam}`).then(res => res.json());
            const keys = Object.keys(data);
            questions = keys.map(key => ({ ...data[key], id: key }));
        }

        displayQuestions(questions, dapAn);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        questionsContainer.innerHTML = "<p>Đã xảy ra lỗi khi tải câu hỏi. Vui lòng thử lại sau.</p>";
    }
}

function displayQuestions(questions, dapAn) {
    questionsContainer.innerHTML = "";
    let correctAnswers = 0;

    questions.forEach(question => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");

        questionDiv.innerHTML = `
            <h3>Câu ${question.id}. ${question.question}</h3>
            ${Object.entries(question.options).map(([option, answer]) => `
                <label>
                    <input type="radio" name="q${question.id}" value="${option}">
                    ${option}. ${answer}
                </label>
            `).join('')}
        `;

        questionDiv.addEventListener("change", () => {
            const selectedOption = questionDiv.querySelector(`input[name="q${question.id}"]:checked`).value;
            const correctOption = dapAn[question.id];

            questionDiv.querySelectorAll("label").forEach(label => {
                label.classList.remove("correct", "incorrect");
                if (label.querySelector("input").value === selectedOption) {
                    label.classList.add(selectedOption === correctOption ? "correct" : "incorrect");
                    if (selectedOption === correctOption) {
                        correctAnswers++;
                    }
                } else if (label.querySelector("input").value === correctOption) {
                    label.classList.add("correct");
                }
            });

            const resultDiv = document.getElementById("result");
            if (resultDiv) {
                resultDiv.innerHTML = `<p>Số câu đúng: ${correctAnswers}/${questions.length}</p>`;
            }
        });

        questionsContainer.appendChild(questionDiv);
    });

    const resultDiv = document.createElement("div");
    resultDiv.id = "result";
    questionsContainer.appendChild(resultDiv);
}

function getRandomKeys(keys, numKeys) {
    const shuffled = keys.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numKeys);
}

const startBtn = document.getElementById('startBtn');

if (startBtn) {
    startBtn.addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const subject = document.getElementById('subject').value;

        if (name.trim() === '') {
            alert('Vui lòng nhập tên của bạn.');
            return;
        }

        const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        const xhr = new XMLHttpRequest();
        xhr.open('POST', googleSheetsURL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("Result submitted successfully to Google Sheets!");
            } else if (xhr.readyState === 4) {
                console.error("Error submitting result to Google Sheets:", xhr.statusText);
            }
        };

        const data = JSON.stringify({
            time: currentTime,
            name: name,
            subject: subject
        });

        xhr.send(data);

        if (subject === 'random') {
            window.location.href = 'quiz.html?subject=random';
        } else if (subject === 'contribute' || subject === 'edit') {
            window.location.href = 'contribution.html?action=' + subject;
        } else {
            window.location.href = `quiz.html?subject=${subject}`;
        }
    });
} else {
    console.error("Không tìm thấy phần tử có ID 'startBtn'.");
}

loadQuestions();
