---
date: 2022-10-22
title: 유니티 UI 갱신을 위해 변수 변화 감지하는 법
keywords: [유니티, UI 컴포넌트, 변수 변화 감지]
---
유니티 개발에도 안드로이드 Koltin의 `LiveData`나 ReactiveX의 `BehaviorSubject`와 같은 컨셉을 사용하면 된다.

## 유니티 UI 컴포넌트가 다른 프레임워크와 다른 점

웹 사이트나 모바일 앱 프론트엔드 개발을 하다가 게임 클라이언트 개발로 넘어 오니 이런 것들이 눈에 밟힌다. 일반적으로 프론트엔드 생태계에서는 UI를 일종의 함수처럼, 그것도 웬만해서는 순수함수처럼 취급하고자 한다. 그렇지만 유니티에서는 UI를 클래스 형태로 취급한다.

### React와 Flutter에서 UI 그리기

이를테면 React 프레임워크의 UI 컴포넌트는 다음과 같다.

```jsx
const Welcome = ({ name }) => {
  return <h1>Hello, { name }</h1>
}
```

물론 예전에 React는 생명주기를 내장하는 클래스 스타일의 UI 컴포넌트를 사용했다. 하지만 현재는 위와 같은 함수형 UI 컴포넌트를 권장하고 있다. 함수형 UI 컴포넌트가 상태 즉 변수의 변화에 따라 자체적으로 UI를 갱신하기 위해서는 `useEffect`이라는 Hook을 사용해야 한다. Hook은 편리하지만 사람들은 분명하게 SideEffect라고 이야기하며 무분별하게 사용하기를 경계한다.

이외에도 Flutter 프레임워크의 `StatelessWidget`은 다음과 같다.

```dart
class Welcome extends StatelessWidget {
  final String name;

  const Welcome({ super.key, required this.name });

  @override
  Widget build(BuildContext) {
    return Text("Hello, $name")
  }
}
```

Flutter 프레임워크 역시 자체적으로 UI를 갱신할 수 있는 `StatefulWidget`를 지원하지만 그럴 필요가 없는 대부분의 상황에는 `StatelessWidget`을 사용하기를 권장하고 있다.

잠깐, 그럴 필요가 없다니? UI는 매번 갱신해야 하지 않나. 그러면 React나 Flutter와 같은 프레임워크는 어떻게 UI를 갱신한다는 걸까?

React나 Flutter 프레임워크에서는 컴포넌트를 처음부터 다시 그린다. React에서는 Redux를 활용하여 아래처럼 작성한다.

```jsx
const Welcome = () => {
  const { name } = useSelector((state) => state)

  return <h1>Hello, { name }</h1>
}
```

`name`이라는 변수가 바뀔 때마다 `Welcome`은 다시 그려질 것이다. 그러니까 `h1` 태그 안에 있는 `name`만 바뀌는 것이 아니라, `h1` 태그부터 모든 것이 다시 그려진다. 즉 `Welcome`이라는 함수가 다시 호출되는 것과 같다.

Flutter에서는 `StreamBuilder`를 사용해서 다음과 같이 작성할 수 있다.

```dart
@override
Widget build(BuildContext context) {
  return StreamBuilder(
    stream: nameStream,
    builder: (context, snapshot) {
      final name = snapshot.data;

      return Welcome(name)
    }
  )
}
```

더욱 명확하게 드러나는데, `nameStream`이라는 스트림에 새로운 값이 넘어올 때마다 `builder`는 다시 호출되고, `Welcome`은 새로운 값을 받아 새로 생성된다.

반면 유니티에서는 어떨까?

### 유니티에서 UI 그리기

유니티에서는 속성을 직접 할당한다.

```cs
public class WelcomeManager : MonoBehavior {
  [SerializedField]
  private TMP_Text tmp;

  private void Start() {
    tmp.text = "Hello, Oh"
  }
}
```

유니티에서는 `TMP_text`가 내부적으로 컴포넌트를 다시 그리든 어떻게 하든, 우리가 할 수 있는 건 `text`라는 변수에 값을 할당하는 방법뿐이다. `text`가 변수라는 사실에 주목하자. React와 Flutter에서는 바뀔 수 있는 값을 컴포넌트 내부에서 상수로 취급했다.

## 유니티 UI 컴포넌트를 다룰 때의 문제점

상태 변화를 일으키는 측에서 너무 많은 부수적인 효과를 또한 구현해야 한다.

아이디와 비밀번호를 입력할 수 있는 로그인 페이지에 있다고 가정해 보자. 로그인 버튼을 누르면 로그인 버튼은 라벨이 "로그인 중..."이라고 바뀌며 누를 수 없어야 하고, 아이디와 비밀번호도 더 이상 입력할 수 없게끔 비활성화해야 한다.

쉽게 말해서 상태가 변화했을 때 잇따라 바뀌어야 하는 변수가 많다. 코드로 작성해 보자.

```cs
public class LoginManager : MonoBehavior {
  [SerializedField]
  private InputField idInputField;

  [SerializedField]
  private InputField passwordInputField;

  [SerializedField]
  private Button submitButton;

  [SerializedField]
  private TMP_Text submitButtonlabel;

  public void OnSubmitted() {
    submitButtonLabel.text = "로그인 중..."

    submitButton.interactable = false;

    idInputField.interactable = false;

    passwordInputField.interactable = false;

    // TODO: 로그인 처리
  }
}
```

나는 이러한 코드를 절대 좋은 코드로 보지 않는다. 왜냐하면 
  1. `OnSubmitted`는 너무 많은 일을 담당하고 있다. UI의 변화를 일으킨 다음에는 로그인에 관련한 비즈니스 로직을 처리해야 할 것이다.
  2. 상태가 바뀜에 따라 결과가 한꺼번에 변화되어야 하지만 코드 수준에서는 따로 있는 변수를 일일이 할당하고 있으므로 개발자가 실수할 가능성이 높다.
  3. 로그인을 처리하는 비교적으로 추상적인 수준의 코드가 UI를 변화시키는 비교적으로 구체적인 수준의 코드에 의존하고 있다. 즉 확장성이 떨어진다.

이러한 문제를 해결하려면 어떻게 하는 것이 좋을까? 추상적인 상태를 변화시키는 코드에서 구체적인 UI를 변화시키지 않도록 만들면 된다. 이와는 반대로 구체적인 UI를 변화시키는 코드가 추상적인 상태를 나타내는 어떤 변수의 변화를 감지하도록 만들어야 한다.

## 변수의 변화를 감지해서 UI 컴포넌트 갱신하기

이건 전혀 새로운 것이 아니다. 자바스크립트와 같이 함수형 프로그래밍에 중점을 두는 쪽에는 ReactiveX가 있고, Kotlin이나 유니티에서 사용하는 C#과 같이 객체지향 프로그래밍에 중점을 두는 쪽에는 Observer 패턴이 있다.

나는 특정한 프로그래밍 방법론에 얽매이기보다는 작성하는 사람의 입장에서 편리한 프로그래밍을 지향한다. 유니티에서 사용하는 C#은 객체지향 프로그래밍 언어이기 때문에 엄격한 Observer 패턴을 사용하는 편이 컨셉에 충실할지라도, 이는 보일러플레이트 코드를 작성하게끔 만들기 때문에 작성하는 사람 입장에서 그다지 편리하지 않다. delegate를 이용하는 편이 단순하다.

바로 예제 코드를 보자.

```cs
public delegate void LiveStateListener<T>(T value);

public interface LiveState<T>
{
  T State { get; }

  void Subscribe(LiveStateListener<T> listener);

  void UnSubscribe(LiveStateListener<T> listener);
}

public class MutableLiveState<T> : LiveState<T>
{
  private LiveStateListener<T> _listener;

  private T _value;

  public T State
  {
      get
      {
          return _value;
      }

      set
      {
          _value = value;

          _listener?.Invoke(_value);
      }
  }

  public void Subscribe(LiveStateListener<T> listener)
  {
      _listener += listener;

      listener.Invoke(_value);
  }

  public void UnSubscribe(LiveStateListener<T> listener)
  {
      _listener -= listener;
  }
}
```

이제부터 변화를 감지할 수 있어야 하는 대상은 `LiveState`로 감쌀 수 있다.

다시 로그인 매니저로 돌아가 보자. "로그인 중"이라는 추상적인 상태를 `pending`이라는 변수로 표현하고 다른 객체가 변화를 감지할 수 있도록 만들 수 있다.

```cs
public class LoginManager : MonoBehavior {
  private readonly MutableLiveState<bool> pending = new MutableLiveState() {
    value = false;
  }

  public LiveState<bool> Pending {
    get {
      return pending;
    }
  }

  public void OnSubmitted() {
    pending = true;

    // TODO: 로그인 처리
  }
}
```

UI에 관련한 여러가지 구체적인 변수의 변경을 한 가지 추상적인 변수의 변경으로 줄일 수 있었다. 마지막으로는 UI 갱신만을 담당하는 클래스를 만들어서 상태 변화를 감지하도록 하자.

```cs
public class LoginUiController : MonoBehavior {
  [SerializedField]
  private LoginManager loginManager;

  [SerializedField]
  private InputField idInputField;

  [SerializedField]
  private InputField passwordInputField;

  [SerializedField]
  private Button submitButton;

  [SerializedField]
  private TMP_Text submitButtonlabel;

  private void Start() {
    loginManager.Pending.Subscribe(OnPendingChanged)
  }

  private void OnPendingChanged(bool state) {
    if (state) {
      submitButtonLabel.text = "로그인 중..."

      submitButton.interactable = false;

      idInputField.interactable = false;

      passwordInputField.interactable = false;
    } {
      ...
    }
  }
  
  private void OnDestroy() {
    loginManager.Pending.Unsubscribe(OnPendingChanged);
  }
}
```

`LoginManager`의 `Pending`이 변화할 때마다 `LoginUiController`의 `OnPendingChanged`가 호출된다.

마지막 두 예제 코드만 보자.
1. 추상적인 수준의 코드와 구체적인 코드의 수준이 분리되었다.
2. 변수를 관찰하는 방법이 편리하다: 추상적인 변수를 `LiveState`로 감싸고 delegate를 등록하라.