let faceMesh;
let video;
let faces = [];
let frames = [];
let totalFrames = 98;
let currentFrame = 0;
let frameDelay = 3;
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

let mic;
let threshold = 0.1;
let isBlow = false;
let isAnimating = true;
let countdown = 12;
let countdownStartTime = null;
let opacity = 255;
let fadeInStartTime = null;
let fadeInDuration = 1000;

let customFont;
let questionImage;
let isClickingQuestionMark = false;
let questionX = 10, questionY = 10;

function preload() {
    faceMesh = ml5.faceMesh(options);
    customFont = loadFont('Orbit-Regular.ttf');
    questionImage = loadImage('image.png');

    for (let i = 1; i <= totalFrames; i++) {
        let filename = nf(i, 4) + ".webp";
        frames.push(loadImage(filename));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO); // 해상도 설정 제거
    video.size(width, height);
    video.hide();
    faceMesh.detectStart(video, gotFaces);

    mic = new p5.AudioIn();
    mic.start();

    textFont(customFont);
}

// ... (나머지 코드는 동일)

function draw() {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();

    if (faces.length > 0 && frames.length === totalFrames) {
        checkBlow();
        if (isAnimating) {
            drawGifOnFace();
        } else {
            drawCountdown();
        }
    }

    drawBlinkingText();
    drawQuestionMark();
}

function checkBlow() {
    let volume = mic.getLevel();
    isBlow = volume > threshold;
}

function drawGifOnFace() {
    let face = faces[0];
    let nose = face.keypoints[1];
    let leftEye = face.keypoints[33];
    let rightEye = face.keypoints[263];

    let centerX = (nose.x + leftEye.x + rightEye.x) / 3 - 150;
    let centerY = (nose.y + leftEye.y + rightEye.y) / 3 - 180;
    let faceWidth = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y) * 4;
    let faceHeight = faceWidth * 0.75;

    if (isBlow) {
        if (frameCount % frameDelay === 0) {
            currentFrame++;
            if (currentFrame >= totalFrames) {
                isAnimating = false;
                countdownStartTime = millis();
                opacity = 0;
                fadeInStartTime = null;
                currentFrame = totalFrames - 1;
            }
        }
    }

    if (fadeInStartTime !== null) {
        let fadeInElapsed = millis() - fadeInStartTime;
        opacity = map(fadeInElapsed, 0, fadeInDuration, 0, 255);
        if (opacity >= 255) {
            opacity = 255;
            fadeInStartTime = null;
        }
    }

    tint(255, opacity);
    image(frames[currentFrame], width - centerX - faceWidth / 2, centerY - faceHeight / 2, faceWidth, faceHeight);
    noTint();
}

function drawCountdown() {
    let elapsed = (millis() - countdownStartTime) / 1000;
    let remaining = max(12 - floor(elapsed), 0);

    fill(255, 0, 0);
    textSize(20);
    textAlign(RIGHT, TOP);
    text(remaining, width - 10, 5);

    if (remaining <= 0) {
        if (fadeInStartTime === null) {
            fadeInStartTime = millis();
            isAnimating = true;
            currentFrame = 0;
            opacity = 0;
        }
    }
}

function drawQuestionMark() {
    image(questionImage, questionX, questionY, 50, 50);

    if (isClickingQuestionMark) {
        fill(255, 0, 0);
        textSize(13);
        textLeading(22);
        textAlign(LEFT, TOP);
        textWrap(WORD);
        text("<외로움을 쫓아내는 허수아비>\n나고로마을의 설명 중 '외로움을 쫓아내는 허수아비'라는 문구에 영감을 받아 외로움을 표현한 작품이다. 외로움은 가슴에 큰 돌이 걸린 느낌과 시야를 차단하는 느낌을 준다. 이를 '외로움'이라 각인된 큰 바위가 얼굴 앞을 가리고 있는 모습으로 표현하였다. 입김을 불어 외로움을 날려 보낼 수 있다. 외로움은 벗어난 것 같아도 어느새 다시 돌아온다. 마치 계절성 감기처럼. 이를 12초 후에 바위가 다시 나타나는 것으로 표현했다. 이 시간은 슬픔이 지속되는 시간인 120분을 기반으로 결정한 것이다.",
            questionX + 55, questionY, width - (questionX + 60));
    }
}

function drawBlinkingText() {
    let alphaValue = map(sin(frameCount * 0.03), -1, 1, 0, 255);
    fill(255, 0, 0, alphaValue);
    textSize(24);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("입김을 불어 돌을 굴러 보내세요.", width / 2, height - 50);
}

function mousePressed() {
    let d = dist(mouseX, mouseY, questionX + 25, questionY + 25);

    if (d < 25) {
        isClickingQuestionMark = !isClickingQuestionMark;
    } else if (isClickingQuestionMark) {
        isClickingQuestionMark = false;
    }
}

function gotFaces(results) {
    faces = results || [];
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
