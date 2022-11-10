---
date: 2022-10-23
keywords: [Unity, 매칭, 멀티플레이]
title: 멀티플레이어 매칭 시스템 구현
---

## 안드로이드와 iOS 기기 간 통신
<iframe class="youtube" src="https://www.youtube.com/embed/OwMUZ1BqyG0" title="Matching between devices in Unity" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 매칭 방식

매칭을 담당하는 `Matcher` 구조체를 구현했다. 대기열을 가지고 있어서 유저를 추가하거나 삭제할 수 있다. `Matcher`는 대기열에 남아 있는 유저들을 가지고 일정한 시간마다 적절한 조합을 검색한다.

이때 어떤 조합이 최적인지 선택하는 책임은 `Dungeon`에 넘기기로 했다. 왜냐하면 던전마다 구체적인 속성을 다르게 가질 것이고 이에 따라 매칭 기준도 달라져야 할 것이기 때문이다.

따라서 `Matcher`는 일정 시간마다 대기열에 남아 있는 사람 중 순서에 상관 없이 n명을 뽑는 모든 경우의 수를 찾아 `Dungeon`의 위임자를 호출한다. 이 위임자는 모든 경우의 수를 받아 하나의 경우의 수를 반환하도록 정의되어 있다.

```go
type Dungeon interface {
  OnSuggest(combinations [][]*User) []*User;
}
```

예컨대 대기열에 추가한 순서대로 먼저 내보내고자 한다면 아래와 같이 단순하게 위임자를 구현할 것이다.

```go
func (d *DungeonImpl) OnSuggest(combinations [][]*User) []*User {
  return combinations[0]
}
```

하지만 어떤 던전에 한에서는 힐러가 무조건 파티에 속해 있어야 한다면 다음과 같이 구현할 수도 있다.

```go
func (d *DungeonImpl) OnSuggest(combinations [][]*User) []*User {
  for _, combination := range combinations {
    for _, user := range combination {
      if user.isHiller {
        return combination
      }
    }
  }

  return nil
}
```

좌우지간 던전마다 조건에 맞게끔 위임자를 구현하면 된다. 이렇게 구체적인 수준의 구현이 달라져도 추상적인 수준으로 정의한 `Matcher`에 대해서는 어느것 하나 수정하지 않아도 되므로 확장성이 있다.

위임자가 `nil`이 아닌 값을 반환하면 `Matcher`는 반환값에 담긴 유저들에게 매칭이 성공했다는 메시지를 보내고 대기열에서 제거한다.

한 번 작업이 실행될 때 최대 하나의 매칭이 성공한다. 물론 예를 들어 두 조합 [1, 2, 3]과 [4, 5, 6]이 동시에 적합하다면 모두 한 번의 작업 안에서 성공시켜도 문제가 없을 것이다. 그렇지만 지금 상황에서는 최대한 단순하게 처리했다.