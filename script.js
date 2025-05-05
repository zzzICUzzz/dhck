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
  const googleSheetsURL2 = 'https://script.google.com/macros/s/AKfycbxrA1UfCfGrPrNBgYs1779VFZD6hDMjSqKxL_pmYMvV-ajiV_uvBn0UStkmjwJutTZp/exec';
  
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
  
    const expirationDate = new Date(2024, 5, 19); // 19/6/2024
    const now = new Date();
    if (now > expirationDate) {
      localStorage.clear();
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
        const clearQuizBtn = document.createElement("button");
        clearQuizBtn.textContent = "Bạn đã làm hết đề, Xóa lưu trữ các đề đã làm.";
        clearQuizBtn.addEventListener("click", () => {
          const savedName = localStorage.getItem('name');
          localStorage.clear();
          if (savedName) localStorage.setItem('name', savedName);
          window.location.href = 'index.html';
        });
        questionsContainer.appendChild(clearQuizBtn);
      }
    }
  }
  
  function getLocalStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (key !== 'name') data[key] = value;
    }
    const savedName = localStorage.getItem('name');
    if (savedName) data['name'] = savedName;
    return data;
  }
  
  // ----- Thay đổi trọng tâm: hàm displayQuestions hỗ trợ radio & checkbox -----
  function displayQuestions(questions, dapAn) {
    const container = document.getElementById("questions-container");
    if (!container) return;
  
    // xóa loading nếu có
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
  
    // chuẩn bị result & progress
    const resultDiv = document.createElement("div");
    resultDiv.id = "result";
    container.appendChild(resultDiv);
  
    // hàm update tổng quan (đúng + đã trả lời)
    function updateSummary() {
      let correctCount = 0;
      let answeredCount = 0;
      questions.forEach(q => {
        const correctAns = dapAn[q.id];
        const isMulti = Array.isArray(correctAns);
        const inputs = container.querySelectorAll(`input[name="q${q.id}"]`);
        // thu thập chọn
        const selected = [];
        inputs.forEach(i => i.checked && selected.push(i.value));
        if (selected.length) answeredCount++;
        // kiểm tra đúng
        let isCorrect = false;
        if (isMulti) {
          const a = selected.slice().sort().join(",");
          const b = correctAns.slice().sort().join(",");
          isCorrect = (a === b);
        } else {
          isCorrect = (selected[0] === correctAns);
        }
        if (isCorrect) correctCount++;
        // lưu trạng thái
        localStorage.setItem(`question_${q.id}`, isCorrect ? "correct" : "incorrect");
      });
      updateProgressBar(answeredCount, questions.length);
      resultDiv.innerHTML = `<p>Số câu đúng: ${correctCount}/${questions.length}</p>`;
    }
  
    questions.forEach(q => {
      const div = document.createElement("div");
      div.classList.add("question");
      const correctAns = dapAn[q.id];
      const isMulti = Array.isArray(correctAns);
      const type = isMulti ? "checkbox" : "radio";
      // dựng HTML
      div.innerHTML = `
        <h3>Câu ${q.id}. ${q.question}</h3>
        ${Object.entries(q.options).map(([opt, txt]) => `
          <label>
            <input type="${type}" name="q${q.id}" value="${opt}">
            ${opt}. ${txt}
          </label>
        `).join('')}
      `;
      // bắt sự kiện chung
      div.addEventListener("change", () => {
        // gỡ class cũ
        div.querySelectorAll("label").forEach(l => {
          l.classList.remove("correct","incorrect");
        });
        // đánh dấu từng label
        const labels = Array.from(div.querySelectorAll("label"));
        labels.forEach(label => {
          const inp = label.querySelector("input");
          if (inp.checked) {
            // nếu được chọn
            const val = inp.value;
            const correct = isMulti
              ? correctAns.includes(val)
              : (correctAns === val);
            label.classList.add(correct ? "correct" : "incorrect");
          }
          // luôn khoanh đáp án đúng
          const val = label.querySelector("input").value;
          if (isMulti) {
            if (correctAns.includes(val)) label.classList.add("correct");
          } else {
            if (correctAns === val) label.classList.add("correct");
          }
        });
        updateSummary();
      });
      container.appendChild(div);
    });
  
    // nút Next Quiz
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Đề tiếp theo (bỏ qua các câu đã làm)";
    nextBtn.addEventListener("click", async () => {
      if (loadingDiv) loadingDiv.style.display = 'block';
      const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const data = getLocalStorageData();
      const form = new FormData();
      form.append('time', now);
      form.append('localStorageData', JSON.stringify(data));
      try {
        await fetch(googleSheetsURL2, { method: 'POST', body: form, mode: 'no-cors' });
        alert("Các câu hỏi đã làm được lưu, bắt đầu đề mới.");
      } catch {
        alert("Lỗi gửi, bắt đầu đề tiếp theo.");
      } finally {
        window.location.href = 'index.html';
      }
    });
    container.appendChild(nextBtn);
  
    // nút Clear Quiz
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Xóa lưu trữ các đề đã làm.";
    clearBtn.addEventListener("click", () => {
      const saved = localStorage.getItem('name');
      localStorage.clear();
      if (saved) localStorage.setItem('name', saved);
      window.location.reload();
    });
    container.appendChild(clearBtn);
  
    // khởi chạy lần đầu
    updateSummary();
  }
  
  function updateProgressBar(answered, total) {
    const bar = document.getElementById("progress-bar");
    const txt = document.getElementById("progress-text");
    if (!bar || !txt) return;
    const p = (answered / total) * 100;
    bar.value = p;
    txt.textContent = `${Math.round(p)}%`;
  }
  
  function getRandomKeys(keys, num) {
    const used = getUsedQuestionKeys();
    const avail = keys.filter(k => !used.includes(k));
    const shuffled = avail.sort(() => 0.5 - Math.random());
    const sel = shuffled.slice(0, num);
    addUsedQuestionKeys(sel);
    return sel;
  }
  
  function saveUsedQuestionKeys(arr) {
    localStorage.setItem('usedQuestionKeys', JSON.stringify(arr));
  }
  function getUsedQuestionKeys() {
    const v = localStorage.getItem('usedQuestionKeys');
    return v ? JSON.parse(v) : [];
  }
  function addUsedQuestionKeys(newKeys) {
    const used = getUsedQuestionKeys();
    saveUsedQuestionKeys([...used, ...newKeys]);
  }
  
  function startQuizTimer(minutes, questions, dapAn) {
    setTimeout(() => {
      let correct = 0;
      questions.forEach(q => {
        const ans = dapAn[q.id];
        const isMulti = Array.isArray(ans);
        const inputs = document.querySelectorAll(`input[name="q${q.id}"]`);
        const sel = [];
        inputs.forEach(i => i.checked && sel.push(i.value));
        if (!isMulti && sel[0] === ans) correct++;
        if (isMulti) {
          const a = sel.slice().sort().join(",");
          const b = ans.slice().sort().join(",");
          if (a === b) correct++;
        }
      });
      alert(`Thời gian làm bài đã hết. Bạn đã trả lời đúng ${correct}/${questions.length} câu.`);
    }, minutes * 60 * 1000);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const loadingDiv = document.getElementById('loading');
  
    if (startBtn) {
      startBtn.addEventListener('click', async () => {
        const nameField = document.getElementById('name');
        const subjectField = document.getElementById('subject');
        let name = nameField.value.trim();
        const subject = subjectField.value;
  
        if (!name) {
          alert('Vui lòng nhập tên của bạn.');
          return;
        }
        if (hasSpecialCharacters(name) || !isValidName(name)) {
          alert('Nhập tên như dị mà coi được đó hả -_-');
          return;
        }
        if (loadingDiv) loadingDiv.style.display = 'block';
        localStorage.setItem('name', name);
  
        const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const form = new FormData();
        form.append('time', now);
        form.append('name', name);
        form.append('subject', subject);
  
        try {
          await fetch(googleSheetsURL, { method: 'POST', body: form });
        } catch (e) {
          console.error("Error submitting result:", e);
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
      console.error("Không tìm thấy startBtn.");
    }
  
    const savedName = localStorage.getItem('name');
    if (savedName) {
      const ni = document.getElementById('name');
      if (ni) ni.value = savedName;
    }
  
    checkSession();
    loadQuestions();
  });
  