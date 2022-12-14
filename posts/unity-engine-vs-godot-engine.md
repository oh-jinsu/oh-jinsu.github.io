---
date: 2022-12-26
title: 유니티 엔진 대 Godot 엔진
---

며칠 전부터 줄곧 Godot 엔진이 눈에 들어왔다. 그동안 체험한 Godot의 장점을 꼽으면 다음과 같다.

1. 기본에 충실한 최소주의를 표방하는 것처럼 보인다. 반면 유니티는 기본보다는 "대단해 보이는" 엔터프라이즈급 기능에 몰두하는 듯한 느낌을 주었다.
2. 친절하고 현대적인 튜토리얼을 가지고 있다. 이건 최소주의를 고수하는 덕분에 가능한 효과라고 생각한다.
3. 오픈소스이기 때문에 무료다. 즉 이용료를 고려할 필요가 없으며 스플래시 스크린과 같은 치사한 패널티에 구애받지 않아도 된다.
4. 노드 시스템은 단순하며 직관적이다. 유니티의 게임오브젝트, 프리팹, 컴포넌트를 Godot은 노드라는 동등한 개념으로 취급한다.
5. UI 시스템이 현대적이고 사용성이 좋다. 유니티가 UI Toolkit과 같은 마크업 도구를 도입했지만 조잡한 사용성을 보이는 것과는 대조적이다.

이러한 많은 장점에도 불구하고 상당히 불편한 부분은 프로그래밍 언어에 대한 지원이었다. Godot은 GDScript라고 일컫는 자체 언어를 권장하고 있다. GDScript는 시그널과 같은 몇몇 멋진 기능을 가지고 있음에도 불구하고 쾌적한 느낌이 없다. 다음과 같은 이유 때문이다.

우선 프로그래밍 언어가 엔진과 강하게 결부되어 있다. 싱글톤은 일반적인 디자인 패턴이지만 엔진의 도움을 받아야 한다(물론 유니티의 DontDestoryOnLoad보다는 훨씬 보기 좋다). 여느 언어들처럼 단순하게 전역 변수나 정적 클래스를 지원하는 편이 어떨까? 아마 엔진의 기본 개념을 위배할 것이다. Godot 엔진은 개념상 노드로 이루어진 씬 아래에서 조작된다. 코드 아래서가 아니다. 즉 조작할 수 있는 최상위 계층이 코드가 아니라 생겼다 사라지는 씬이므로 우리에게 익숙한 전역 변수나 정적 클래스는 존재할 수 없는 것이다. 그래서 Godot은 실제로 기왕의 싱글톤에 대응하는 개념을 "AutoLoad"라고 일컫는다. 싱글톤이란 다시 말해 자동으로 불러오는 씬 내지 노드에 불과한 것이다.

사실 시그널도 어떨까? 시그널은 고마운 기능이지만 편리하고 강력한 덕분이라기보다도 "이거라도 있어서 다행"이기 때문이었다. 흔히 옵저버라고 불리는 패턴은 특히 클라이언트 개발에 있어서 필수적이라고 생각한다. 클라이언트의 특성상 한 가지 변화에 잇따라 여러가지 변화가 일어나야 한다. 이때 한 가지 변화가 여러가지 변화를 알게 만들기 보다는 여러가지 변화가 한 가지 변화를 알게 만드는 편이 복잡도를 낮추고 확장성을 높인다. 이를 옵저버 패턴이 실현해 주는 것이다. 하지만 재사용성을 지닌 옵저버 패턴을 구현하기 위해서는 사실 언어 및 IDE의 적잖은 지원이 필요하다. 인터페이스, 제네릭, 자동 상속 커맨드, 혹은 람다식까지도. 이러한 지원이 부실하다면 보일러플레이트 코드를 야기하고 생산성을 떨어뜨릴 수밖에 없다. 기왕에 잘 다져진 언어들은 그러한 기능을 이미 갖추고 있을 것이지만, GDScript는 그렇지 못하다. 구현하는 방법을 제공하기보다는 옵저버 패턴을 그 자체를 제공하고 있을 뿐이다. 이것이 시그널이다. 이러한 방식은 확장성이 없다.

다음으로 GDScript는 기본적으로 동적 타입 언어이기 때문에 컴파일 타임에 미리 에러를 확인하기 어려운 부분을 가지고 있다. 분명 정적 타이핑을 지원하려고 시도하고 있으나 아직은 서투른 수준이다. 추상 클래스, 제네릭 인자, Type Narrowing 등의 기능들도 당연히 빠져 있다. 같은 동적 타입 언어인 Javascript는 Typescript라는 도구를 통해 모든 걸 해내지만 GDScript에서는 이정도의 강력한 지원을 기대하기 어렵다. 그밖에도 람다식이 아직 준비 단계에 있으며, Stream을 지원하지 않는 등 API가 현대적이라고 보기 어려운 점들이 있다. 아마 Flash로 ActionScript2.0를 다룰 때에 답답함을 느끼지 못했던 것처럼 Godot의 GDScript로 프로그래밍을 시작했다면 이러한 투정도 없었을 것이다. 그렇지만 Typescript, Koltin, Rust 등의 현대적인 언어의 편의를 한껏 누리다가 왔으므로 답답함을 느끼는 것도 사실이다.

사정이 그러할 것이 GDScript는 본래 Godot 엔진의 기능을 극대화시키기 위해 만든 언어라고 소개되어 있다. 프로그래머의 욕심 같아서는 프로그래밍이 엔진을 서포트해야 하기보다는 엔진이 프로그래밍을 서포트해 주었으면 하지만 현실은 또 그렇지 못한 성싶다.

다행히도 Godot은 C#을 지원한다. 위의 단점은 C#을 사용함으로써 대부분 극복할 수 있다 C#을 사용하기 위한 세팅도 그다지 어렵지 않다. 솔루션을 빌드할 때도 많은 문제가 있는 편이 아니다. 엔진의 범위를 초과하여 프로젝트를 관리해야 하는 점이나 별도의 IDE를 사용해야 하는 점이 있기는 하다. 그렇지만 웹 서비스 개발에 익숙한 덕분에 오히려 불편하게 느껴지지 않는다. 이렇게 보면 결국 익숙함과 스타일의 문제인 것 같다.
