# HTML5_Project

### Naviagation Blog

### 프로젝트 : 스토리텔링 기반을 위한 블로그 만들기. 컨셉은 항해하는 돛단배

설명 (프로젝트 동기 및 설명) : 이미 우리는 이쁘고 좋은 기능을 제공하는 블로그들을 많이 알고 있습니다. 하지만 대부분이 카테고리화 되어있는, 문서형태와 아코디언 방식이 주를 이루고 있습니다. 이러한 방식이 정보를 전달하기 위해서는 좋은 방식이지만, 스토리텔링 기반의 이야기를 전달하는데는 늘 부족함을 느꼈습니다. 그래서 저는 블로그 주인의 개성과 세계관, 가치관이 더욱 녹아든 스토리텔링 기반의 블로그를 만들고자 합니다. 컨셉은 '항해하는 돛단배'입니다. 블로그 속 돛단배는 바다를 항해하다가 섬과 같은 오브젝트들을 마주하게 되고, 그 섬에 도달하게 되면 그곳에 관련된 360도 영상, 동영상, 사진, 글 등을 접할 수 있습니다. 즉 블로그 주인의 세계관 속에 진입하고 나면, 그 곳에서 항해를 하다가우연히 마주하게 되는 이야기들을 통해 블로그를 접하는 새로운 경험을 만들어보고자 합니다.

### 사용할 HTML5 명세

WebGL, Three.js, svg(대표적인 자바스크립트 3D 라이브러리입니다.)

### 개발 계획

#### week1 (8/1~8/7)

- WebGl을 위한 기본적인 함수들의 기능을 학습
- Scene/renderer/camera/Basic Object
- 아래에 나와있는 예제들을 만들어보면서 최종적으로 돛단배 객체를 만들 것입니다.
- https://aerotwist.com/tutorials/getting-started-with-three-js/
- http://blog.teamtreehouse.com/the-beginners-guide-to-three-js
- 참고 학습링크)http://davidscottlyons.com/threejs/presentations/frontporch14/#slide-0

ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

Goo Engine Library를 사용하여 구현하였습니다.
처음 커밋에 라이브러리가 많아서 제가 커스터마이징할 코드 구현부가 별로 없었지만, 웹지엘에 대한 학습을 할 수 있었습니다.
뒷부분으로 갈수록 로직 구현부를 하면서 개념학습한 것들 정리도 함께 올리겠습니다.


####  week2 (8/8~8/14)

- 돛단배 객체의 움직임(키보드 컨트롤) 구현
- webGL, threejs의 키보드 이벤트에 대해 학습한다
- https://stemkoski.github.io/Three.js/Keyboard.html
- http://www.johannes-raida.de/tutorials/three.js/tutorial07/tutorial07.htm

####  week3 (8/15~8/21)

- 돛단배 객체가 항해할 바다 배경오브젝트 구현
- 카메라 시점과, 조명에 대한 개념을 학습한다.
- 학습 참고 링크
- http://threejs.org/examples/#webgl_shaders_ocean
- http://threejs.org/examples/#webgl_shaders_ocean2

####  week4 (8/22~8/28)

- 돛단배 객체가 항해하며 마주할 수 있는 섬 객체 1개 구현
- http://jeremybouny.fr/ocean/demo/
- 섬 객체에 도달하는 이벤트 발생시 보여줄 360도 영상(유투브 영상 이용) 세팅

####  week5 (8/29~9/4)
- 돛단배 객체의 항해와 섬에 도달할 시 보여지는 이벤트 전체 시뮬레이션
- 리팩토링


####  참고 사이트

- https://c1.goote.ch/c8a05c9a6d4a4929a3fa50e6ebdee0c3.scene/
