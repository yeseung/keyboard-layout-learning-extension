

const typingApp = {
    // 키보드 정보
    keyInfo: [
        { // 한글
            keys: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', "\\"],
                ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', '[', ']'],
                ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ';', "'"],
                ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', ',', '.', '/']
            ],
            levels: [
                'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ', // 1단계
                'ㅋㅌㅊㅍㅠㅜㅡ',      // 2단계
                'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ', // 3단계
                'ㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ', // 4단계
                '1234567890'            // 5단계
            ]
        },
        { // 영어
            keys: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', "\\"],
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
                ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
            ],
            levels: [
                'ASDFGHJKL',            // 1단계
                'ZXCVBNM',              // 2단계
                'QWERTYUIOP',           // 3단계
                'ASDFGHJKLZXCVBNMQWERTYUIOP', // 4단계
                '1234567890'            // 5단계
            ]
        }
    ],

    // 공통 레벨 정보 (키 비교용)
    commonLevels: [
        'ASDFGHJKL',            // 1단계
        'ZXCVBNM',              // 2단계
        'QWERTYUIOP',           // 3단계
        'ASDFGHJKLZXCVBNMQWERTYUIOP', // 4단계
        '1234567890'            // 5단계
    ],

    // 왼손으로 누르는 키들
    leftHandKeys: 'QWERTASDFGZXCVB123456',

    // 앱 상태
    currentKeys: [],
    currentChars: [],
    currentKeyCodes: [],
    currentCharIndex: -1,
    isRunning: false,
    language: 0, // 0: 한글, 1: 영어
    level: 0,
    levelCount: 0,
    levelLimit: 16,

    // 초기화
    init() {
        document.getElementById('keyp_a').innerHTML = this.drawKeyboardPosition(0);
        this.showSetup();
    },

    // 키보드 생성
    createKeyboard() {
        const keyboardEl = document.getElementById('kbd_a');
        const keys = this.keyInfo[this.language].keys;
        const englishKeys = this.keyInfo[1].keys; // 영어 키 코드 참조용

        let html = '';

        // 키보드 행별로 생성
        keys.forEach((row, rowIndex) => {
            html += `<div class="key-row">`;

            row.forEach((key, keyIndex) => {
                // 영어 키 코드를 ID로 사용 (한글/영어 공통)
                const keyCode = englishKeys[rowIndex][keyIndex];
                const keyId = keyIndex < (rowIndex === 0 ? 10 :
                    rowIndex === 1 ? 10 :
                        rowIndex === 2 ? 9 : 7) ? `id="k_${keyCode}"` : '';

                html += `<div class="key" ${keyId}>${key}</div>`;
            });

            html += `</div>`;
        });

        keyboardEl.innerHTML = html;
    },

    // 키 다운 이벤트 처리
    handleKeyDown(event) {
        if (!this.isRunning) return;
        if (this.currentCharIndex > 7) {
            this.start();
            return;
        }

        const pressedKey = event.key.toUpperCase();
        const expectedKey = this.currentKeyCodes[this.currentCharIndex];

        if (pressedKey === expectedKey) {
            // 정확한 키 입력
            document.getElementById(`c_${this.currentCharIndex}`).classList.add('ok');
            document.getElementById(`k_${pressedKey}`).classList.remove('down');

            this.currentCharIndex++;
            this.levelCount++;

            if (this.currentCharIndex > 7) {
                if (this.levelCount >= this.levelLimit) {
                    this.isRunning = false;
                    this.showSetup();
                    return;
                }
                this.start();
            } else {
                document.getElementById(`c_${this.currentCharIndex}`).classList.add('on');
                this.highlightCurrentKey();
            }

            this.updateProgress();
        }
    },

    // 시작 함수
    start() {
        this.createKeyboard();
        document.getElementById('setup_ct').style.display = 'none';

        // 선택된 레벨 확인
        const levelInputs = document.forms['setup_f1'].elements['kp'];
        let selectedLevel = 0;
        for (let i = 0; i < levelInputs.length; i++) {
            if (levelInputs[i].checked) {
                selectedLevel = i;
                break;
            }
        }
        this.level = selectedLevel;

        // 랜덤 문자 선택
        const levelChars = this.keyInfo[this.language].levels[this.level];
        const levelLength = levelChars.length;

        this.currentChars = [];
        this.currentKeyCodes = [];

        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * levelLength);
            this.currentChars[i] = levelChars[randomIndex];
            this.currentKeyCodes[i] = this.commonLevels[this.level][randomIndex];
        }

        // 문자 표시 업데이트
        let charsHtml = '';
        for (let i = 0; i < 8; i++) {
            charsHtml += `<div id="c_${i}" class="char">${this.currentChars[i]}</div>`;
        }
        document.getElementById('char_a').innerHTML = charsHtml;

        this.currentCharIndex = 0;
        this.isRunning = true;

        document.getElementById('c_0').classList.add('on');
        this.highlightCurrentKey();
        this.updateProgress();

        // 키보드 이벤트 리스너 설정
        document.onkeydown = (e) => this.handleKeyDown(e);
    },

    // 현재 키 하이라이트
    highlightCurrentKey() {
        const currentKey = this.currentKeyCodes[this.currentCharIndex];
        document.getElementById(`k_${currentKey}`).classList.add('down');
    },

    // 진행률 업데이트
    updateProgress() {
        const progress = Math.min(Math.floor((this.levelCount / this.levelLimit) * 100), 100);
        document.getElementById('progress_bar').style.width = `${progress}%`;
    },

    // 설정 화면 표시
    showSetup() {
        this.levelCount = 0;
        document.getElementById('setup_ct').style.display = 'flex';
        this.updateProgress();
    },

    // 키보드 위치 시각화
    drawKeyboardPosition(level) {
        let html = '<div class="key-visual">';

        // 각 행별로 표시 (위에서 아래로)
        html += '<div style="margin-left:-9px">';
        html += level === 4 ? '■■■■■■■■■■■■' : '□□□□□□□□□□□□';
        html += '</div>';

        html += '<div>';
        html += (level === 2 || level === 3) ? '■■■■■■■■■■■■' : '□□□□□□□□□□□□';
        html += '</div>';

        html += '<div>';
        html += (level === 0 || level === 3) ? '■■■■■■■■■■■' : '□□□□□□□□□□□';
        html += '</div>';

        html += '<div>';
        html += (level === 1 || level === 3) ? '■■■■■■■■■■' : '□□□□□□□□□□';
        html += '</div>';

        html += '</div>';
        return html;
    },

    // 키보드 위치 선택
    selKeyP(level) {
        document.getElementById('keyp_a').innerHTML = this.drawKeyboardPosition(level);
    },

    // 언어 선택
    selKeyL(language) {
        this.language = language;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    typingApp.init();

    document.getElementById("kl_0").addEventListener("click", () => typingApp.selKeyL(0));
    document.getElementById("kl_1").addEventListener("click", () => typingApp.selKeyL(1));

    document.getElementById("kp_0").addEventListener("click", () => typingApp.selKeyP(0));
    document.getElementById("kp_1").addEventListener("click", () => typingApp.selKeyP(1));
    document.getElementById("kp_2").addEventListener("click", () => typingApp.selKeyP(2));
    document.getElementById("kp_3").addEventListener("click", () => typingApp.selKeyP(3));
    document.getElementById("kp_4").addEventListener("click", () => typingApp.selKeyP(4));

    document.getElementById("startBtn").addEventListener("click", () => typingApp.start());
});
