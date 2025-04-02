let faceMesh;
let video;
let faces = [];
let videoObject;
let mic;
let soundLevel = 0;
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false};
let isPlaying = false;
let isVideoFinished = false;
let opacity = 255;
let countdown = 0;
let countdownInterval;
let isClickingQuestionMark = false;
let myFont;
let questionImage;

function preload() {
    faceMesh = ml5.faceMesh(options);
    videoObject = createVideo("video.mp4");
    videoObject.hide();
    myFont = loadFont("Orbit-Regular.ttf");
    questionImage = loadImage("image.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(myFont);

    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    faceMesh.detectStart(video, gotFaces);

    videoObject.volume(0);
    videoObject.position(-1000, -1000);
    videoObject.pause();

    mic = new p5.AudioIn();
    mic.start();

    videoObject.onended(() => {
        videoObject.hide();
        isPlaying = false;
        isVideoFinished = true;
        faceMesh.detectStop();
        opacity = 0;
        countdown = 12;

        countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        setTimeout(() => {
            faceMesh.detectStart(video, gotFaces);
            isVideoFinished = false;
            countdown = 0;

            let fadeInInterval = setInterval(() => {
                opacity += 10;
                if (opacity >= 255) {
                    opacity = 255;
                    clearInterval(fadeInInterval);
                }
            }, 100);
        }, 12000);
    });
}

function draw() {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();

    soundLevel = mic.getLevel();

    if (faces.length > 0 && !isVideoFinished) {
        let face = faces[0];
        let nose = face.keypoints[1];
        let leftEye = face.keypoints[33];
        let rightEye = face.keypoints[263];

        let centerX = (nose.x + leftEye.x + rightEye.x) / 3;
        let centerY = (nose.y + leftEye.y + rightEye.y) / 3;
        let mirrorCenterX = width - centerX;

        let faceWidth = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y) * 3;
        let faceHeight = faceWidth * 0.75;

        videoObject.position(mirrorCenterX - faceWidth / 2, centerY - faceHeight / 2);
        videoObject.size(faceWidth + 0, faceHeight + 0);
        videoObject.style("opacity", opacity / 255);
        videoObject.style("pointer-events", "none"); // 클릭 이벤트 비활성화

        if (soundLevel > 0.005) {
            if (!isPlaying) {
                videoObject.play();
                isPlaying = true;
            }
        } else {
            if (isPlaying) {
                videoObject.pause();
                isPlaying = false;
            }
        }
        videoObject.show();
    } else {
        if (!isVideoFinished) {
            videoObject.hide();
        }
    }

    let alphaValue = map(sin(frameCount * 0.05), -1, 1, 0, 255);
    fill(255, 0, 0, alphaValue);
    textSize(24);
    textAlign(CENTER, CENTER);

    textStyle(BOLD);
    text("입김을 불어 돌을 굴러 보내세요.", width / 2, height - 50);

    let questionX = 10, questionY = 10;
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

    if (isVideoFinished && countdown > 0) {
        fill(255, 0, 0);
        textAlign(RIGHT, TOP);
        textSize(20);
        text(` ${countdown}`, width - 20, questionY);
    }
}

function mousePressed() {
    handleClick(mouseX, mouseY);
}

function touchStarted() {
    handleClick(touchX, touchY);
}

function handleClick(x, y) {
    let questionX = 20, questionY = 10;
    if (x > questionX && x < questionX + 50 && y > questionY && y < questionY + 50) {
        isClickingQuestionMark = !isClickingQuestionMark;
    } else if (isClickingQuestionMark) {
        isClickingQuestionMark = false;
    }
}

function gotFaces(results) {
    faces = results;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}