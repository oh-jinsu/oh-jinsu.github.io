---
date: 2021-12-21
title: Flutter로 MVVM 패턴 구현하기
keywords: [Flutter, MVVM]
---
## MVVM 패턴이란?
MVVM 패턴은 프론트엔드를 모델과 뷰 그리고 뷰모델의 세 계층으로 나누는 설계다. 핵심은 뷰모델인데 뷰와 모델을 의존하지 않도록 분리해야 한다. <a href="https://pub.dev/packages/provider" target="_blank" rel="noreferrer">Provider</a>나 <a href="https://pub.dev/packages/get" target="_blank" rel="noreferrer">GetX</a>를 사용할 필요가 있을까? 구현을 쉽게 만들어 주지만 필수적이지는 않다. 거추장스러운 상태 관리 라이브러리를 사용하지 않고도 Flutter로 MVVM 패턴을 구현할 수 있다.

## 뷰모델 예제
뷰모델은 애플리케이션의 동작을 미리 정의한다. 뷰나 모델을 구현하지 않고서도 말이다. 이를테면 로그인 폼을 떠올려 보자. 이용자가 입력할 수 있는 이메일과 비밀번호 속성을 있을 것이다. 제출 버튼을 누를 수도 있다. 다음과 같이 추상 클래스를 적어 본다.

```dir
lib/viewmodel.dart
```
```dart
abstract class SignInViewModel {
  String get email;
  
  String get password;

  void onEmailChanged(String value);

  void onPasswordChanged(String value);

  void onSubmitted();
}
```

getter로 출력하고 메서드로 입력을 받고 있다. 벌써 작은 애플리케이션을 하나 만든 셈이다. 모의로 테스트 코드를 적어 보자.

```dir
test/viewmodel_test.dart
```
```dart
import 'package:test/test.dart';
import 'package:app/viewmodel.dart';

void main() {
  group("SignInViewModel", () {
    test("email should be changed", () {
      final SignInViewModel viewModel;

      viewModel.onEmailChanged("sample");

      expect(viewModel.email, "sample");
    });

    test("password should be changed", () {
      final SignInViewModel viewModel;

      viewModel.onPasswordChanged("password");

      expect(viewModel.password, "********");
    });
  });
}
```

뷰모델의 테스트 코드는 애플리케이션의 동작을 기술한다. 주어진 코드에 따르면 `onEmailChanged` 메서드의 인자에 문자열 `"sample"`을 넣어 호출한 경우 `viewModel.email`의 값은 `"sample"`로 바뀔 것이다. 또한 `onPasswordChanged` 메서드는 인자로 넘겨 받은 문자열의 길이만큼 `viewModel.password`에 `*`을 채워넣을 것이다.

물론 테스트는 아직 통과하지 않는다. 변수 `viewModel`에 아무것도 할당하지 않았기 때문이다. `SignInViewModel`은 추상 클래스이기 때문에 인스턴스로 생성할 수 없다. 그러므로 구체 클래스를 구현해야 한다. 덧붙이자면 이러한 플로우를 <a href="https://ko.wikipedia.org/wiki/테스트_주도_개발" target="_blank" rel="noreferrer">테스트 주도 개발</a>이라고 일컫는다.

테스트 코드를 통과시킬 수만 있다면 어떻게 구현하든 문제가 되지 않는다. 다음과 같이 적는 방법도 있다.

```dir
lib/viewmodel_impl.dart
```
```dart
class SignInViewModelImpl implements SignInViewModel {
  String _email = "";
  @override
  String get email => _email;

  String _password = "";
  @override
  String get password => _password;

  @override
  void onEmailChanged(String value) {
    _email = value;
  }

  @override
  void onPasswordChanged(String value) {
    _password = value.replaceAll(RegExp(r"."), "*");
  }

  @override
  void onSubmitted() {}
}
```

테스트 코드를 통과할 수 있도록 뷰모델 구현이 끝났다. 아래 테스트 코드는 통과한다.

```dir
test/viewmodel_test.dart
```
```dart
import 'package:test/test.dart';
import 'package:app/viewmodel.dart';
import 'package:app/viewmodel_impl.dart';

void main() {
  group("SignInViewModel", () {
    test("email should be changed", () {
      final SignInViewModel viewModel = SignInViewModelImpl();

      viewModel.onEmailChanged("sample");

      expect(viewModel.email, "sample");
    });

    test("password should be changed", () {
      final SignInViewModel viewModel = SignInViewModelImpl();

      viewModel.onPasswordChanged("password");

      expect(viewModel.password, "********");
    });
  });
}
```

## 뷰 예제
### 뷰모델 의존성 주입
뷰모델을 뷰에서 사용해 보자. 뷰모델은 뷰를 참조하지 않아야 한다. 뷰는 생성자를 통해 뷰모델 의존성을 주입받을 수 있다.

```dir
lib/view.dart
```
```dart
import 'package:flutter/material.dart';

class SignInView extends StatelessWidget {
  final SignInViewModel viewModel;

  const SignInView({super.key, required this.viewModel});

  @override
  Widget build(BuildContext context) { ... }
}
```

`MaterialApp`에서 아래와 같이 구체 클래스의 의존성을 주입한다.

```dir
lib/main.dart
```
```dart
import 'package:flutter/material.dart';
import 'package:app/view.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: SignInView(
        viewModel: SignInViewModelImpl(),
      ),
    );
  }
}
```

다음은 뷰모델을 이용해 UI를 구성하면 된다. 뷰로 돌아가 아래와 같이 이어 적어 본다.

```dir
lib/view.dart
```
```dart
import 'package:flutter/material.dart';

class SignInView extends StatelessWidget {
  final SignInViewModel viewModel;

  const SignInView({super.key, required this.viewModel});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Column(
        children: [
          Text(viewModel.email),
          TextField(onChange: viewModel.onEmailChanged),
          Text(viewModel.password),
          TextField(onChange: viewModel.onPasswordChanged),
        ]
      )
    );
  }
}
```

아직 주어진 코드는 올바르게 작동하지 않는다. 예상과는 달리 앱을 실행시켜서 `TextField`에 값을 입력해도 `Text` 위젯의 값은 변하지 않을 것이다.

왜냐하면 `SignInView`가 단 한 번만 렌더링하기 때문이다. 다시 말해 런타임에 뷰모델의 속성은 틀림없이 변경되겠지만 이에 맞춰서 뷰가 UI를 다시 그리지 않는다. 그러므로 뷰모델의 속성이 변경될 때마다 UI를 갱신하게끔 만들어야 하는 것이다.

### 뷰모델 구독하기
어떻게 구현해야 할까? Provider나 GetX는 뷰모델이 속성을 갱신했다는 사실을 뷰에게 일일이 보고하게끔 되어 있다. 따라해 보자면 아래와 같은 식이다.

```dir
lib/viewmodel_impl.dart
```
```dart
class SignInViewModelImpl implements SignInViewModel {
  String _email = "";
  @override
  String get email => _email;

  @override
  void onEmailChanged(String value) {
    _email = value;

    refreshUI()
  }
}
```

`refreshUI` 메서드를 보자. Provider에서 이름은 `ChageNotifier.notifyListener`이고, GetX에서 이름은 `GetxController.update`로 다를 뿐 작동은 같다. 그러나 이러한 방식은 번거로울 뿐더러 뷰에 대한 의존성을 만든다. 생각해 보자. 만약 뷰모델이 속성을 변경했지만 그 사실을 뷰에게 알리는 것을 잊는다면 어떨까? 우리의 예측과는 다르게 애플리케이션이 동작하게 된다.

그래서 GetX에는 속성에 적용할 수 있는 옵저버 패턴으로 `Obx`가 있다. 마치 안드로이드에서 사용하는`LiveData`와 같다. 이건 뷰모델이 뷰에게 변경을 알리는 방식이 아니라 뷰가 뷰모델의 변경을 구독하는 방식이다. 여기서는 Dart에서 기본적으로 지원하는 `Stream`을 이용하여 구현해 본다. 뷰모델의 속성을 새로 정의하자.

```dir
lib/viewmodel.dart
```
```dart
abstract class SignInViewModel {
  Stream<String> get email;
  
  Stream<String> get password;

  void onEmailChanged(String value);

  void onPasswordChanged(String value);

  void onSubmitted();
}
```

이제 뷰모델의 속성을 `Stream` 형태로 제공할 것이다. 이렇게 하면 뷰가 속성을 구독할 수 있다. Flutter는 `Stream` 형태의 데이터를 뷰에서 쉽게 구독할 수 있도록 `StreamBuilder` 위젯을 제공한다. 뷰를 다시 구현해 보자.

```dir
lib/view.dart
```
```dart
import 'package:flutter/material.dart';

class SignInView extends StatelessWidget {
  final SignInViewModel viewModel;

  const SignInView({super.key, required this.viewModel});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Column(
        children: [
          StreamBuilder(
            stream: viewModel.email,
            builder: (context, AsyncSnapshot<String> snapshot) {
              if (snapshot.hasData) {
                return Text(snapshot.data!);
              }

              return const Text("");
            },
          ),
          TextField(onChange: viewModel.onEmailChanged),
          StreamBuilder(
            stream: viewModel.password,
            builder: (context, AsyncSnapshot<String> snapshot) {
              if (snapshot.hasData) {
                return Text(snapshot.data!);
              }

              return const Text("");
            },
          ),
          TextField(onChange: viewModel.onPasswordChanged),
        ]
      )
    );
  }
}
```

`StreamBuilder`를 보자. 물론 `StreamBuilder`는 완벽히 뷰모델의 속성을 구독하기 위한 용도로 설계되지 않았기 때문에 거슬리는 문법도 남아 있다. 그렇지만 문법을 깔끔하게 만드는 일은 뒤로하고 우선은 `Stream`과 `StreamBuilder`를 통해 올바른 의존 관계를 만드는 방식에 주목한다. 마지막으로 `SignInViewModel`을 재정의했으므로 구체 클래스의 구현을 바꿔준다.

```dir
lib/viewmodel_impl.dart
```
```dart
class SignInViewModelImpl implements SignInViewModel {
  final _email = StreamController<String>.broadcast()..add("");

  @override
  Stream<String> get email => _email.stream;

  final _password = StreamController<String>.broadcast()..add("");
  @override
  Stream<String> get password =>
      $password.stream.map((value) => value.replaceAll(RegExp(r"."), "*"));


  @override
  void onEmailChanged(String value) {
    _email.sink.add(value);
  }

  @override
  void onPasswordChanged(String value) {
    _password.sink.add(value);
  }

  @override
  void onSubmitted() {}
}
```

`StreamController.broadcast`를 사용했다. 속성은 어디서든 여러번 구독할 수 있어야 하기 때문이다. 속성을 할당할 때에는 `Sink.add` 메서드를 호출한다. `Stream`의 특성을 이용해서 `password` 속성이 출력되는 처리도 바꿨다. 이제 뷰는 뷰모델과 함께 올바르게 작동한다.

## 모델 예제
제출 기능을 완성시키면서 모델을 다뤄 보도록 하자. 제출 버튼을 누르면 입력한 이메일과 비밀번호를 미리 준비한 올바른 데이터와 비교한 다음 인증 정보의 불리언 값을 조작하는 과정이다.

올바른 이메일과 비밀번호 정보를 가지고 있는 데이터베이스 클래스를 만든다.

```dir
lib/db.dart
```
```dart
class Database {
  const _email = "sample";

  const _password = "password";

  bool _authorized = false;

  String getEmail() {
    return _email;
  }

  String getPassword() {
    return _password;
  }

  void setAuthorized(bool value) {
    _authorized = value;
  }
}
```

자, 이제 비교하는 과정을 구현해 보자. 구현을 공백으로 남겨 둔 `SignInViewModel.onSubmitted` 메서드다.

여기서 주의해야 할 점은 아직 제출 버튼을 누른 시점에 이메일과 비밀번호 정보를 알 수 없다는 것이다. `StreamController`로 생성한 `Stream`이 값을 저장하지 않기 때문이다. `Stream`은 이름 그대로 값을 흘려보낼 뿐 가지고 있지는 않는다. <a href="https://pub.dev/packages/rxdart" target="_blank" rel="noreferrer">RxDart</a>의 `ValueStream`을 이용하면 만사가 편해질 테지만 이번에는 굳이 이용하지 않기로 한다.

모델을 구현하는 단계에서는 그다지 중요한 대목이 아니므로 다음과 같이 고쳐 적었다.

```dir
lib/viewmodel_impl.dart
```
```dart
class SignInViewModelImpl implements SignInViewModel {
  late String _email;
  final $email = StreamController<String>.broadcast();
  @override
  Stream<String> get email => $email.stream;

  late String _password;
  final $password = StreamController<String>.broadcast();
  @override
  Stream<String> get password =>
      $password.stream.map((value) => value.replaceAll(RegExp(r"."), "*"));

  SignInViewModelImpl() {
    $email.stream.listen((value) {
      _email = value;
    });

    $email.add("");

    $password.stream.listen((value) {
      _password = value;
    });

    $password.add("");
  }

  ...
}
```

코드가 난잡하지만 중요한 건 제출 버튼을 누른 시점에 이메일과 비밀번호를 각각 `_email`과 `_password` 속성을 통해 알 수 있게 되었다는 점이다. 이를 충족한다면 어떤 식으로 구현하든 문제가 되지 않는다. `SignInViewModel.onSubmitted` 메서드로 돌아가 구현을 이어 나간다.

```dir
lib/viewmodel_impl.dart
```
```dart
class SignInViewModelImpl implements SignInViewModel {
  final database = Database();

  late String _email;

  late String _password;

  @override
  void onSubmitted() {
    if (_email != database.getEmail()) {
      return;
    }

    if (_password != database.getPassword()) {
      return;
    }

    database.setAuthorized(true)
  }
  ...
}
```

주어진 코드는 작동한다. 그렇지만 의존 관계가 잘못되었다. 뷰모델은 데이터베이스를 참조하고 있다. 다르게 말해서 뷰모델은 데이터베이스의 구현에 의존해야 한다. 뷰모델과 모델 사이에 이러한 의존 관계는 다음과 같은 문제를 낳는다.
1. 뷰모델에 유닛 테스트를 실시할 수 없다. 데이터베이스가 뷰모델의 성능에 영향을 끼친다.
2. 데이터 계층과 독립적으로 개발이 불가능하다. 이를테면 프론트엔드 개발이 백엔드의 구현 여부에 따라 늦어지게 된다.

그러므로 뷰모델을 올바르게 구현하기 위해서는 모델을 먼저 구현해서는 안 된다. 하지만 동시에 뷰모델을 구현하기 위해서는 모델로부터 데이터를 가져오는 동작을 기술할 필요가 있다. 모델을 미리 정의할 필요가 있다는 의미다. 여기서 핵심은 모델을 뷰모델의 필요에 따라 정의하는 것이다. 이를 <a href="https://ko.wikipedia.org/wiki/인터페이스_(컴퓨팅)" target="_blank" rel="noreferrer">인터페이스</a>라고 부르곤 한다.

데이터베이스는 여러가지를 읽고 쓸 수 있지만 지금 뷰모델이 필요로 하는 명세는 이메일과 비밀번호를 읽고 인증 정보를 쓰는 것뿐이다. Dart 코드로는 다음과 같이 적는다.

```dir
lib/db.dart
```
```dart
abstract class Database {
  String getEmail();

  String getPassword();

  void setAuthorized(bool value);
}
```

존재하지 않는 구체 클래스를 할당할 수 없으니 뷰모델은 생성자를 통해 인스턴스를 주입받을 것이다. 뷰모델을 다음과 같이 고쳐 적는다.

```dir
lib/viewmodel_impl.dart
```
```dart
class SignInViewModelImpl implements SignInViewModel {
  final Database database;

  SignInViewModelImpl({
    required this.database,
  }) {
    ...
  }
  ...
}
```

끝으로 데이터베이스의 구체 클래스를 구현한다.

```dir
lib/db_impl.dart
```
```dart
class DatabaseImpl implements Database {
  const _email = "sample";

  const _password = "password";

  bool _authorized = false;

  @override
  String getEmail() {
    return _email;
  }

  @override
  String getPassword() {
    return _password;
  }

  @override
  void setAuthorized(bool value) {
    _authorized = value;
  }
}
```

의존성을 올바르게 주입한 `MaterialApp`은 최종적으로 다음과 같은 모습이 될 것이다.

```dir
lib/main.dart
```
```dart
import 'package:flutter/material.dart';
import 'package:app/view.dart';
import 'package:app/viewmodel_impl.dart';
import 'package:app/db_impl.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: SignInView(
        viewModel: SignInViewModelImpl(
          database: DatabaseImpl(),
        ),
      ),
    );
  }
}
```

이로써 별도의 상태관리 라이브러리를 사용하지 않고 MVVM 패턴을 구현해 보았다. 애플리케이션의 동작을 미리 정의하도록 뷰모델을 작성했다. 그리고 `Stream`을 이용하여 뷰가 뷰모델의 속성을 구독하게끔 만들었다. 마지막으로 뷰모델의 필요에 따라 정의한 인터페이스를 통해 모델과의 의존 관계를 역전시켰다.

여기에 상태관리 라이브러리를 도입한다면 코드를 훨씬 깔끔하고 편리하게 작성할 수 있다. 원리를 숙지하고 라이브러리를 사용하는 것과 그렇지 않은 것과 차이는 크다.