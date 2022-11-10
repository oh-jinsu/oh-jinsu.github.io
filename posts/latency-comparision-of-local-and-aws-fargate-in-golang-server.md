---
date: 2022-10-16
keywords: [Golang, 지연 시간, 로컬, AWS Fargate]
title: Golang 서버에서 로컬 및 AWS Fargate의 지연 시간 비교
---

멀티플레이어 게임 서버 구현에 앞서 핑 서버를 구현했다. 로컬에서 구동한 결과 지연 시간이 1~2ms로 나타났고, AWS Fargate에서 구동한 결과 지연 시간이 6~7ms로 나타났다.

<iframe class="youtube" src="https://www.youtube.com/embed/jiUbbsAWTTU" title="ping between unity client and local golang server" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />

로컬에서 서버를 구동시켰다. 콘솔에 지연 시간이 1~2ms 가량 찍히는 것이 보인다.

<img src="https://d2qpmclmyatf0n.cloudfront.net/rpg-server-service.png" alt="fargate status">

로컬에서 잘 작동하는 모습을 확인했으니 AWS Fargate를 이용해 서버를 구동시켰다. EC2 등 별도의 리소스를 관리하고 싶지 않았기 때문이다. 네트워크 로드밸런서와 함께 구성했다.

<iframe class="youtube" src="https://www.youtube.com/embed/9Xmmzbqb9bg" title="ping between unity client and remote golang server" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

AWS Fargate로 구동한 결과 지연 시간이 6~7ms 찍히고 있는 모습이다. 물론 AWS Fargate의 성능보다는 네트워크 환경에 커다란 영향을 받는다.