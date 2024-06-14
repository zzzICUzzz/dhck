const files = {
    "gp1_220.json": 9,
    "gpnew.json": 2,
    "ngoai966_1438.json": 10,
    "ngoainew.json": 2,
    "nhi1736_2028.json": 10,
    "nhinew.json": 2,
    "san1439_1735.json": 10,
    "sannew.json": 2,
    "sl221_495.json": 9,
    "slnew.json": 2,
    "noi496_965.json": 10,
    "noinew.json": 2
};

const googleSheetsURL = 'https://script.google.com/macros/s/AKfycbyocQCX9hkmdzkpyGcgpThpgnzplnlu159nLFFqHk6MGYV9fPCXoEJcOjMzFyIkh1azZA/exec';

const SESSION_LIMIT_MINUTES = 10000000000;
const QUIZ_TIME_LIMIT_MINUTES = 50;

function hasSpecialCharacters(input) {
    const regex = /[^a-zA-Z0-9À-ỹ\s]/;
    return regex.test(input);
}

function isValidName(name) {
    const invalidNames = ["Z"];
    return name.length > 1 && !invalidNames.includes(name);
}

function checkSession() {
    if (!sessionStorage.getItem('visited')) {
        sessionStorage.setItem('visited', 'true');
        window.location.href = 'index.html';
    }    
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === 'index.html' || currentPage === '') {
        sessionStorage.removeItem('sessionStartTime');
        localStorage.removeItem('usedQuestionKeys');  // Clear used questions on reset
        return;
    }

    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    if (sessionStartTime) {
        const startTime = new Date(sessionStartTime).getTime();
        const currentTime = new Date().getTime();
        const sessionLimit = SESSION_LIMIT_MINUTES * 60 * 1000;

        if (currentTime - startTime > sessionLimit) {
            alert("Your session has expired. You will be redirected to the homepage.");
            window.location.href = 'index.html';
        } else {
            // Set timeout for the remaining time
            setTimeout(() => {
                alert("Your session has expired. You will be redirected to the homepage.");
                window.location.href = 'index.html';
            }, sessionLimit - (currentTime - startTime));
        }
    } else {
        sessionStorage.setItem('sessionStartTime', new Date().toISOString());
        setTimeout(() => {
            alert("Your session has expired. You will be redirected to the homepage.");
            window.location.href = 'index.html';
        }, SESSION_LIMIT_MINUTES * 60 * 1000);
    }
}

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

            startQuizTimer(QUIZ_TIME_LIMIT_MINUTES, questions, dapAn);
        } else {
            const data = await fetch(`json/${subjectParam}`).then(res => res.json());
            const keys = Object.keys(data);
            questions = keys.map(key => ({ ...data[key], id: key }));
        }

        displayQuestions(questions, dapAn);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        const questionsContainer = document.getElementById("questions-container");
        if (questionsContainer) {
            questionsContainer.innerHTML = "<p>Đã xảy ra lỗi khi tải câu hỏi. Vui lòng thử lại sau.</p>";
        }
    }
}

function displayQuestions(questions, dapAn) {
    const questionsContainer = document.getElementById("questions-container");
    if (!questionsContainer) return;

    let correctAnswers = 0;
    let answeredQuestions = 0;

    questions.forEach((question, index) => {
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

            answeredQuestions++;
            updateProgressBar(answeredQuestions, questions.length);

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

    // Add the "Next Quiz" button
    const nextQuizBtn = document.createElement("button");
    nextQuizBtn.textContent = "Đề tiếp theo (bỏ qua các câu đã làm)";
    nextQuizBtn.addEventListener("click", () => {
        // Reload the page to generate a new quiz
        window.location.reload();
    });
    questionsContainer.appendChild(nextQuizBtn);

    // Add the "Clear Quiz" button
    const clearQuizBtn = document.createElement("button");
    clearQuizBtn.textContent = "Xóa lưu trữ các đề đã làm.";
    clearQuizBtn.addEventListener("click", () => {
        // Clear used questions and reload the page to generate a new quiz
        localStorage.removeItem('usedQuestionKeys');
        alert('Đã xóa các câu hỏi đã sử dụng.');
        window.location.reload();
    });
    questionsContainer.appendChild(clearQuizBtn);
}

function updateProgressBar(answeredQuestions, totalQuestions) {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    if (!progressBar || !progressText) return;

    const progress = (answeredQuestions / totalQuestions) * 100;
    progressBar.value = progress;
    progressText.textContent = `${Math.round(progress)}%`;
}

function getRandomKeys(keys, numKeys) {
    const usedKeys = getUsedQuestionKeys();
    const availableKeys = keys.filter(key => !usedKeys.includes(key));
    const shuffled = availableKeys.sort(() => 0.5 - Math.random());
    const selectedKeys = shuffled.slice(0, numKeys);

    addUsedQuestionKeys(selectedKeys);

    return selectedKeys;
}

function saveUsedQuestionKeys(usedKeys) {
    localStorage.setItem('usedQuestionKeys', JSON.stringify(usedKeys));
}

function getUsedQuestionKeys() {
    const usedKeys = localStorage.getItem('usedQuestionKeys');
    return usedKeys ? JSON.parse(usedKeys) : [];
}

function addUsedQuestionKeys(newKeys) {
    const usedKeys = getUsedQuestionKeys();
    const updatedKeys = [...usedKeys, ...newKeys];
    saveUsedQuestionKeys(updatedKeys);
}

function startQuizTimer(minutes, questions, dapAn) {
    setTimeout(() => {
        const correctAnswers = questions.reduce((total, question) => {
            const selectedOption = document.querySelector(`input[name="q${question.id}"]:checked`);
            return total + (selectedOption && selectedOption.value === dapAn[question.id] ? 1 : 0);
        }, 0);

        alert(`Thời gian làm bài đã hết. Bạn đã trả lời đúng ${correctAnswers}/${questions.length} câu.`);
    }, minutes * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const startBtn = document.getElementById('startBtn');
    const loadingDiv = document.getElementById('loading');

    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            let name = document.getElementById('name').value.trim();
            const subject = document.getElementById('subject').value;

            if (name === '') {
                alert('Vui lòng nhập tên của bạn.');
                return;
            }

            if (hasSpecialCharacters(name) || !isValidName(name)) {
                alert('Nhập tên như dị mà coi được đó hả -_-');
                return;
            }

            if (loadingDiv) {
                loadingDiv.style.display = 'block';
            }

            localStorage.setItem('name', name);

            const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

            const formData = new FormData();
            formData.append('time', currentTime);
            formData.append('name', name);
            formData.append('subject', subject);

            try {
                await fetch(googleSheetsURL, { method: 'POST', body: formData });
                console.log("Result submitted successfully to Google Sheets!");
            } catch (error) {
                console.error("Error submitting result to Google Sheets:", error);
            }

            setTimeout(() => {
                if (subject === 'random') {
                    window.location.href = 'quiz.html?subject=random';
                } else if (subject === 'contribute' || subject === 'edit') {
                    window.location.href = 'contribution.html?action=' + subject;
                } else {
                    window.location.href = `quiz.html?subject=${subject}`;
                }
            }, 1000);
        });
    } else {
        console.error("Không tìm thấy phần tử có ID 'startBtn'.");
    }

    const savedName = localStorage.getItem('name');
    if (savedName) {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.value = savedName;
        } else {
            console.error("Không tìm thấy phần tử có ID 'name'.");
        }
    }

    checkSession();
    loadQuestions();
});
