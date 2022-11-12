---
date: 2022-11-11
title: 어떻게 우리나라 시간을 ISO 8601으로 표현해야 하는가
keywords: [프로그래밍, ISO 8601, UTC Offset, Date]
---

우리나라 시간은 2022-11-11T08:30:00.000과 같은 ISO 8601 시간 표현 뒤에 반드시 UTC Offset +09:00를 덧붙여 표현해야 한다. 즉 2022-11-11T08:30:00.000+09:00처럼 말이다. 그렇지 않으면 2022-11-10T23:30:00.000Z와 같이 동일한 UTC 시간으로 표현하도록 한다.

## ISO 8601이란?

ISO 8601은 날짜와 시간에 대한 표현을 교환할 때 오해를 줄이기 위해 만들어진 국제 표준이다.

흔하게 찾아볼 수 있는 ISO 8601은 날짜와 시간과 그 사이에 구분자 T, 그리고 맨 뒤에 <a href="https://en.wikipedia.org/wiki/UTC_offset" target="blank" rel="noreferrer">UTC Offset</a>으로 구성되어 있다. 이를테면
YYYY-MM-DDThh:mm:ss.sss±hh:mm과 같은 꼴이다.

## UTC Offset을 사용해야 하는 이유

UTC Offset을 사용하지 않은 시간 표현은 보는 이에 따라 상대적으로 평가되기 때문에 오해가 생기기 쉽다.

가령 데이터베이스에 UTC Offset을 제외한 2022-11-11T08:30:00.000이라는 값이 저장되어 있다고 생각해 보자.

- 우리나라에 사는 누군가에게 11일 8시 30분은 UTC 시간으로 10일 23시 30분이다.
- 샌프란시스코에 사는 누군가에게 11일 8시 30분은 UTC 시간으로 11일 16시 30분이다.
- 영국에 사는 누군가에게 11일 8시 30분은 UTC 시간도 똑같이 11일 8시 30분이다.

어렵게 생각하지 말자. 우리나라에 사는 누군가의 시계에 11일 8시 30분이 찍혀 있다면 그때 영국은 10일 23시일 것이다. 반대로 샌프란시스코에 사는 누군가의 시계에 11일 16시 30분이 찍혀 있다면 그때 영국은 11일 12시 30분일 것이다.

모두가 같은 정보를 보지만 다른 시간을 생각하고 있다. UTC 시간이 시간대 변환 없이 곧바로 Unix epoch와 호환된다는 사실을 떠올려 보자. Unix epoch는 UTC 시간 1970년 1월 1일부터 지금까지 흐른 초를 나타낸 숫자다.

우리나라에 사는 사람은 시간이 실제보다 덜 지났다고 생각하고, 샌프란시스코에 사는 사람은 실제보다 시간이 더 지났다고 생각하는 것이다!

## 기술적으로 말해서

예를 들어 다음과 같은 자바스크립트 코드가 있다고 해 보자.

1.
```js
console.log(new Date("2022-11-11T08:30:00.000"))

// 우리나라에서: 2022-11-10T23:30:00.000Z
// 샌프란시스코에서: 2022-11-11T16:30:00.000Z
```

이 코드를 우리나라에서 Node.js로 실행한 결과는 2022-11-10T23:30:00.000Z이다. 여기서 맨 뒤에 Z는 특수한 표준 시간대 지정자(time zone designator)로 UTC Offset ±00:00와 동일한 의미를 가진다. 즉 표현된 시간이 UTC 시간이라는 뜻이다.

그런데 동일한 코드를 샌프란시스코에서 실행한다면 결과는 2022-11-11T16:30:00.000Z로 달라진다. 거듭 말하지만 샌프란시스코에 사는 누군가에게 11일 8시 30분은 UTC 시간으로 11일 16시 30분이기 때문이다.

같은 문자열이지만 코드를 실행하는 타임존에 따라 다른 시간으로 평가되는 것이다. 이는 타임존이 서로 다른 환경에서 UTC Offset 없이 시간 표현을 주고받을 때 생기는 문제를 시사한다. 반면 다음과 같은 코드를 보자.

2. 
```js
console.log(new Date("2022-11-10T23:30:00.000Z"))

// 우리나라에서: 2022-11-10T23:30:00.000Z
// 샌프란시스코에서: 2022-11-10T23:30:00.000Z
```

인자로 넣은 문자열은 1번 예제 코드를 우리나라에서 실행한 결과다. 즉 2022년 11월 11일 8시 30분이라는 우리나라 시간을 UTC 시간으로 나타낸 것과 같다. 이 UTC 시간을 그대로 다시 한번 평가시켰을 뿐이다.

당연하게도 이 경우에는 우리나라에서 실행시키든 샌프란시스코에서 실행시키든 결과가 동일하다. Z라는 표준 시간대 지정자를 붙여 주었기 때문에 어디서든 같은 UTC 시간을 바라보기 때문이다.

이와 동일한 결과가 나오는 코드는 아래와 같다.

3.
```js
console.log(new Date("2022-11-11T08:30:00.000+09:00"))

// 우리나라에서: 2022-11-10T23:30:00.000Z
// 샌프란시스코에서: 2022-11-10T23:30:00.000Z
```

인자로 넣은 문자열의 2022-11-11T08:30:00.000이라는 시간은 우리나라에 사는 사람 관점에서 적힌 시간이다. UTC 시간으로는 주어진 결과에 보이는 것처럼 2022-11-10T23:30:00.000Z로 나오는 것이 맞다. 

그렇지만 샌프란시스코에서도 올바르게 2022-11-10T23:30:00.000Z라는 결과가 나오는 이유는 바로 UTC Offset을 +09:00로 명시해 주었기 때문이다. UTC Offset이 없는 1번 예제에서는 분명 2022-11-11T16:30:00.000Z라는 결과가 나온 바 있다.

하지만 이 경우 적힌 시간이 UTC Offset 덕분에 UTC보다 9시간이 빠른 장소의 시간이라는 사실을 알 수 있으므로 시간 표현을 올바르게 평가할 수 있는 것이다.