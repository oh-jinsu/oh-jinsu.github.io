---
date: 2022-10-01
title: CORS 에러를 프록시 설정으로 해결해야 하는 이유
keywords: [프론트엔드, CORS, 크로스 도메인 쿠키, JWT 인증, 프록시]
---
## CORS 에러란?
CORS는 Cross-Origin Resource Sharing 약자다. 이름처럼 CORS 에러는 교차 출처의 리소스를 가져올 때 발생한다. 브라우저가 교차 출처의 응답에서 허용하는 출처 정보와 스스로의 출처 정보를 비교한 다음 다르다면 접근할 수 없도록 차단하는 것이다. 그렇기 때문에 교차 출처 측에서 내보내는 응답에 `Access-Control-Allow-*` 헤더를 와일드카드(`*`)나 맞춤 출처로 설정하면 에러를 쉽게 해결할 수 있다. 하지만 이는 크로스 도메인 쿠키에 관한 문제들을 안고 있는 탓에 프록시 설정으로 CORS 에러를 해결하는 편을 추천하고 싶다.

## 크로스 도메인 쿠키에 관한 문제들
### 확장성 문제
구체적으로 문제는 백엔드 API 서버와 프론트엔드 애플리케이션이 나뉜 구조에서 쿠키를 주고받을 때 발생한다. 반대로 쿠키를 주고받지 않는다면 `Access-Control-Allow-*` 헤더를 변경하는 방법만으로 충분하다. 그러나 쿠키를 주고받지 않는 경우는 흔하지 않다. 특히 JWT 인증을 구현해야 한다면 피할 수 없다.

물론 API 서버와 모바일 애플리케이션 사이에서 발생하는 문제는 아니다. 모바일 애플리케이션과의 통신에서는 쿠키를 사용하지 않기 때문이다. 이를테면 리프레시 토큰과 같이 민감한 상태 정보도 API 서버는 단순하게 응답 바디로 제공할 것이다.

```js
> console.log(await res.json())
> {
    "refresh_token": "eyJhbGc..."
  }
```

하지만 브라우저에서 이렇게 해서는 안 된다. <a href="https://ko.wikipedia.org/wiki/사이트_간_스크립팅" target="_blank" rel="noreferrer">XSS</a> 및 <a href="https://ko.wikipedia.org/wiki/사이트_간_요청_위조" target="_blank" rel="noreferrer">CSRF</a> 공격에 취약하기 때문이다. 브라우저에서 상태 정보를 안전하게 보관하기 위해서는 HttpOnly Secure 쿠키를 사용해야 한다. 그렇다면 서버 측에서는 다음과 같이 헤더를 수정하기만 하면 되는 걸까?

```js
{
  "Set-Cookie": "refresh_token=eyJhbGc...;Path=/;HttpOnly;Secure;SameSite=None",
  "Access-Control-Allow-Origin": "https://oh-jinsu.github.io",
}
```

API 서버가 하나의 클라이언트만을 고려한다면 문제 없다. 하지만 <a href="https://www.google.com/search?client=safari&rls=en&q=hexagonal+architecture&ie=UTF-8&oe=UTF-8" target="_blank" rel="noreferrer">헥사고날 아키텍처</a>처럼 단일한 도메인 서버에 모바일이나 웹 등 다양한 클라이언트가 접근할 수 있는 설계에서는 기능을 중복 구현해야 할 의무가 생긴다. 이른바 Controller 계층에서만 최소한으로 수정이 이뤄질 테지만 그럼에도 바깥 계층 때문에 안쪽 계층을 수정해야 하는 일은 그리 적절치 않다. 확장성이 떨어지는 것이다.

게다가 `Set-Cookie`의 도움으로 민감 정보를 주고받기 위해서는 브라우저가 요청할 때 <a href="https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials" target="_blank" rel="noreferrer">credentials</a> 속성을 `include`로 설정해야 하는데, 이 경우 `Access-Control-Allow-Origin` 헤더에는 와일드카드(`*`)를 사용할 수 없도록 제한되어 있다. 즉 응답이 단 한 가지의 출처만 허용할 수 있다는 뜻이다. 이 또한 확장성을 떨어뜨리고 기능을 중복해서 구현할 필요성을 초래한다.

물론 API 서버를 변경할 수 있는 권한 자체를 가지고 있지 않다면 이 모든 방편은 고려할 수조차 없다.

### 브라우저 정책 문제

가장 골칫거리는 브라우저 정책 문제다. 단적으로 예를 들어 보자. 사파리 브라우저는 기본적으로 크로스 도메인 쿠키를 전송하지 않는다. 자바스크립트가 <a href="https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials" target="_blank" rel="noreferrer">credentials</a> 속성을 `include`로 변경한다고 해도 말이다. 반면 크롬에서는 잘 작동하니 놓치기 쉬운 점이다. 

Safari > Preferences > Privacy 탭으로 들어가 Website tracking 옵션을 확인해 보자. Prevent cross-site tracking 속성이 활성화되어 있다. API 서버가 민감 정보를 쿠키를 통해 제대로 전달받기 위해서는 Prevent cross-site tracking 속성을 꺼야만 한다. 이 속성이 꺼져 있어야만 사파리는 크로스 도메인 쿠키를 전송할 수 있다.

그렇지만 어떤 웹 사이트를 이용하기 위해서 브라우저 속성을 바꿔야만 한다니! 이건 절대 훌륭한 사용자 경험이 아니다.

## 프록시 설정으로 CORS 에러 해결하기

그렇다면 어떻게 해야 할까? 답은 간단하다. 크로스 도메인 쿠키를 이용하지 않으면 된다. 이것이 프록시 설정이 CORS 에러를 해결하는 원리다. 다시 말하지만 CORS 에러는 브라우저가 판단한다. 따라서 브라우저가 직접 API 서버와 통신하지 못하도록 만드는 것이다. 대신 브라우저에게 내용을 응답하는 웹 애플리케이션 서버가 API 서버와 통신하게끔 만든다.

React, Next.js, Vue, Nuxt.js 모두 웹 애플리케이션 서버라는 사실을 기억하자. 모두 프록시 설정을 위한 라이브러리나 빌트인 컨픽을 가지고 있다. 예를 들어 Next.js는 <a href="https://nextjs.org/docs/api-reference/next.config.js/rewrites" target="_blank" rel="noreferrer">Rewrites</a>라는 기능으로 프록시 설정을 제공한다.

```dir
next.config.js
```
```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/favorite-songs',
        destination: 'https://api.ohjinsu.me/favorite-songs',
      },
    ]
  },
}
```

브라우저가 `http://localhost:3000`에서 열려 있다고 생각해 보자. 브라우저는 우선 `http://localhost:3000/api/favorite-songs`로 요청을 보낸다. 웹 애플리케이션 서버로 보내는 요청이다. 그러면 웹 애플리케이션 서버는 다시 `https://api.ohjinsu.me/favorite-songs`로 요청을 보내는 식이다.

당연한 말이지만 프록시 설정이 응답 바디에 담긴 정보를 쿠키 형태로 브라우저에 저장해 주지는 않는다. API 서버에서 응답 바디로 제공받은 민감 정보는 웹 애플리케이션 서버가 브라우저에게 제공할 때 쿠키 형태로 저장해 주어야 한다. Next.js에서는 <a href="https://nextjs.org/docs/api-routes/introduction" blank="_target" rel="noreferrer">API Routes</a>를 통해 아래와 같이 구현할 수 있다.

```dir
pages/api/auth/refresh.js
```
```js
const handler = async (req, res) => {
  const response = await fetch("https://api.ohjinsu.me/auth/refresh", {
    method: "POST",
    body: JSON.stringify(req.body),
  })

  const { refreshToken } = await response.json();

  res
    .status(201)
    .setHeader(
      "Set-Cookie",
      `refresh_token=${refreshToken};Path=/;HttpOnly;Secure;SameSite=Strict`,
    )
    .json({})
}

export default handler
```


`SameSite` 플래그를 `Strict`로 설정한 것에 주목하자. 여기서는 크로스 도메인 쿠키를 사용하지 않기 때문이다.

이로써 프록시 설정으로 CORS 에러를 해결했다. 마지막으로 이러한 방식의 장점을 정리하자면 다음과 같다.
1. 확장성을 유지할 수 있다.
2. 서버를 변경할 수 있는 권한을 가지지 않아도 된다.
3. 브라우저마다 제각각인 쿠키 정책을 고려할 필요가 없다.