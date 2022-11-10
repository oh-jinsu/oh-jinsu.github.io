---
date: 2022-10-10
title: Github Actions를 통한 AWS Lambda 배포 자동화
keywords: [AWS Lambda, 배포 자동화, Github Actions, 컨테이너 이미지]
---
## 왜 Github Actions인가
<a href="https://github.com/features/actions" target="_blank" rel="noreferrer">Github Actions</a>는 Github에서 Push, Pull Request와 같은 특정한 이벤트가 발생할 때 개발자가 작성해 놓은 스크립트를 자동으로 실행시켜 주는 기능이다.

많은 개발자가 Github에 코드를 저장한다. 코드를 저장한 다음에 한 번 더 통합과 배포를 명령할 필요가 없다고 생각했다. 게다가 코드를 저장하는 일과 통합하고 배포하는 일이 따로 이루어진다면 저장된 코드와 배포된 코드가 일치하지 않을 위험도 생긴다.

글에서는 Github Actions를 통해 AWS Lambda 배포를 자동화하는 방법을 예제와 함께 소개한다.

## AWS Lambda를 컨테이너 이미지로 배포해야 하는 이유
<a href="https://aws.amazon.com/lambda/" target="blank" rel="noreferrer">AWS Lambda</a>는 서버를 관리할 필요 없이 컴퓨팅 자원만으로 함수를 실행시킬 수 있도록 AWS가 제공하는 서비스다. AWS Console에서 코드를 직접 입력하는 방법을 제외하고 .zip 파일 또는 컨테이너 이미지를 업로드하는 두 가지 배포 형태를 지원한다. 결정적으로는 다음과 같은 이유로 인해 컨테이너 이미지로 배포하는 방법을 선택했다.

- .zip 파일로 업로드하는 경우에는 압축을 푼 상태에서 자료의 크기가 250MB를 초과하지 않아야 한다는 제약이 있다.
- .zip 파일로 업로드하는 경우에는 Node.js의 bcrpyt와 같이 운영체제에 의존하는 의존성을 사용하기 어렵다.
- 컨테이너 이미지 자체가 어떤 환경에서든 작동하는 애플리케이션 단위로 구성된다는 점에서 .zip 파일보다 뛰어난 범용성을 가진다.

여기서는 컨테이너 이미지를 업로드하기 위해 Amazon ECR을 사용한다. Amazon ECR은 AWS가 제공하는 완전관리형 도커 컨테이너 레지스트리로서 AWS Lambda와 같은 다른 서비스와 간편하게 연동할 수 있다는 장점이 있다.

람다 함수를 컨테이너 이미지로 빌드하려면 Dockerfile을 작성해야 할 것이다. 방법은 매우 다양하다. 이를테면 같은 Node.js 런타임이더라도 Javascript를 사용하는지 Typescript를 사용하는지에 따라, 또 관련한 설정에 따라 천차만별이다. 자세하게는 <a href="https://docs.aws.amazon.com/lambda/latest/dg/images-create.html#images-create-from-base" target="_blank" rel="noreferrer">AWS 공식 문서</a>를 참고하여 상황에 맞게끔 Dockerfile을 작성하기를 권한다.

## Github Actions 작성하기
AWS Lambda를 컨테이너 이미지로 배포하는 과정은 다음과 같다.

1. 일련의 컨테이너 이미지를 업로드할 Amazon ECR 레포지토리를 생성한다.
2. Github 레포지토리의 소스 코드를 가지고 컨테이너 이미지를 빌드한다.
3. 빌드한 컨테이너 이미지를 Amazon ECR 레포지토리에 업로드한다.
4. Amazon ECR 레포지토리에 업로드한 컨테이너 이미지로 AWS Lambda를 갱신한다.

이 과정을 Github Actions로 구현하면 되는 것이다. 차근차근 해 보자.

### Github Actions 파일 생성하기
Github Actions는 .yml 형식으로 작성할 수 있다.

```dir
.github/workflows/deploy.yml
```
```yml
name: Deploy
```

### 실행 조건 정의하기

.github/workflows 디렉토리 아래 .yml 파일을 생성하고 원하는 이름을 짓는다. `Deploy`라고 지었다.

```yml
on:
  push:
    branches: 
      - main
      - dev
```

main 브랜치와 dev 브랜치에서 `push` 이벤트가 발생할 때 스크립트를 실행하도록 작성했다. main는 상용 dev는 개발용 으로 구분한 것이다.

### 사전 준비하기
```yml
jobs:
  build:
    runs-on: ubuntu-latest

    env:
      APPLICATION_NAME: ${{ github.event.repository.name }}-${{ github.ref_name }}
      CONTAINER_NAME: ${{ github.event.repository.name }}-${{ github.ref_name }}:${{ github.sha }}
      ECR_PREFFIX: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com
```

`env`에 스크립트 실행 중 사용할 변수를 정의했다. 
- `APPLICATION_NAME`은 말 그대로 독립적인 애플리케이션을 가리키는 이름이다. Amazon ECR 레포지토리와 AWS Lambda의 이름으로 사용한다. 끝에 `-main` 혹은 `-dev`와 같이 브랜치 이름을 붙여 환경을 구분했다.
- `CONTAINER_NAME`은 ECR 레포지토리에 업로드할 컨테이너 이미지 각각을 가리키는 이름이다. 커밋 해시를 태그로 사용해 버전을 구분했다.
- `ECR_PREFFIX`에는 편의상의 목적으로 ECR 레포지토리 URL를 할당한다.

```yml
steps:
  - uses: actions/checkout@v3
```

본격적으로 단계를 작성해 보자. 우선 `actions/checkout@v3`을 이용해 Github Actions가 레포지토리에 접근할 수 있도록 만든다.

```yml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}
```

다음으로는 Github Actions가 AWS CLI를 이용할 수 있도록 이용자의 인증 정보를 입력한다. 인증 정보를 Github Actions Secret에 안전하게 저장할 수 있다. AWS ACCESS KEY ID와 AWS SECRET ACCESS KEY는 AWS IAM에서 발급받을 수 있다.

### ECR 레포지토리 생성하기

```yml
- name: Login to Amazon ECR
  uses: aws-actions/amazon-ecr-login@v1

- name: Make an ECR repository if it does not exist
  run: aws ecr describe-repositories --repository-names ${{ env.APPLICATION_NAME }} || aws ecr create-repository --repository-name ${{ env.APPLICATION_NAME }} --image-scanning-configuration scanOnPush=true --image-tag-mutability IMMUTABLE
```

우선 `aws-actions/amazon-ecr-login@v1`을 통해 로그인한 다음 ECR 레포지토리를 생성할 것이다. 만약 첫 번째 실행이 아니라서 ECR 레포지토리가 이미 존재한다면 레포지토리를 만들지 않고 넘어간다. 이때 `--image-tag-mutability` 옵션을 `IMMUTABLE`로 설정하여 한번 레포지토리에 업로드한 컨테이너 이미지라면 더 이상 임의로 변경할 수 없도록 설정했다.

### 컨테이너 이미지 빌드 및 업로드하기
```yml
- name: Build a container image
  run: docker build -t ${{ env.CONTAINER_NAME }} .

- name: Tag the container image
  run: docker tag ${{ env.CONTAINER_NAME }} ${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }}

- name: Push the container image
  run: docker push ${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }}
```

특별한 것은 없다. Github Actions는 미리 준비해 둔 Dockerfile을 읽어들여 컨테이너 이미지를 빌드하고 이를 앞선 단계에서 생성한 ECR 레포지토리에 배포한다.

### AWS Lambda 갱신하기

```yml
- name: Check if the Lambda function exists
  id: lambdaExists
  run: aws lambda get-function --function-name ${{ env.APPLICATION_NAME }}
  continue-on-error: true

- name: Check if the role exists
  id: roleExists
  if: steps.lambdaExists.outcome == 'failure'
  run: aws iam get-role --role-name lambda-${{ env.APPLICATION_NAME }}
  continue-on-error: true

- name: Create a new role if it does not exist
  if: steps.lambdaExists.outcome == 'failure' && steps.roleExists.outcome == 'failure'
  run: >
    aws iam create-role --role-name lambda-${{ env.APPLICATION_NAME }} --assume-role-policy-document '{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }]}' && sleep 30s

- name: Attach the basic execution role
  if: steps.lambdaExists.outcome == 'failure' && steps.roleExists.outcome == 'failure'
  run: aws iam attach-role-policy --role-name lambda-${{ env.APPLICATION_NAME }} --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

- name: Create a Lambda function if the Lambda function does not exist
  if: steps.lambdaExists.outcome == 'failure'
  run: aws lambda create-function --function-name ${{ env.APPLICATION_NAME }} --code ImageUri=${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }} --package-type Image --role arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/lambda-${{ env.APPLICATION_NAME }}
```
만약 첫 실행이라면 AWS Lambda를 갱신하기보다 먼저 생성해야 한다. Github Action은 미리 정해둔 이름으로 AWS Lamda 함수가 존재하는지 확인한다. 존재하지 않는다면 그다음으로 AWS Lambda를 실행시키기 위한 IAM Role이 있는지 확인하고, 없다면 이 역시 새로 생성한다. 

짚어 두자면 Role을 생성하고 나서 넉넉하게 30초를 기다리도록 했다. 무슨 이유인지는 몰라도 막 생성한 IAM Role로 AWS Lambda를 만들면 IAM Role이 적합하지 않다는 식의 에러가 발생하는 탓이다.

약간의 시간이 지나면 IAM Role을 이용할 수 있게 된다. 이와 함께 미리 ECR 레포지토리에 업로드한 컨테이너 이미지를 연결하여 AWS Lambda를 생성한다. 

```yml
- name: Update the Lambda function if the Lambda function does exist
  if: steps.lambdaExists.outcome == 'success'
  run: aws lambda update-function-code --function-name ${{ env.APPLICATION_NAME }} --image-uri ${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }}
```

만약 람다 함수가 이미 존재한다면 ECR 레포지토리에 새로 업로드한 컨테이너 이미지를 연결하기만 하면 끝난다.

### 한눈에 보기

```dir
.github/workflows/deploy.yml
```
```yml
name: Deploy

on:
  push:
    branches: 
      - main
      - dev

jobs:
  build:
    runs-on: ubuntu-latest

    env:
      APPLICATION_NAME: ${{ github.event.repository.name }}-${{ github.ref_name }}
      CONTAINER_NAME: ${{ github.event.repository.name }}-${{ github.ref_name }}:${{ github.sha }}
      ECR_PREFFIX: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v1

      - name: Make an ECR repository if it does not exist
        run: aws ecr describe-repositories --repository-names ${{ env.APPLICATION_NAME }} || aws ecr create-repository --repository-name ${{ env.APPLICATION_NAME }} --image-scanning-configuration scanOnPush=true --image-tag-mutability IMMUTABLE

      - name: Build a container image
        run: docker build -t ${{ env.CONTAINER_NAME }} .

      - name: Tag the container image
        run: docker tag ${{ env.CONTAINER_NAME }} ${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }}

      - name: Push the container image
        run: docker push ${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }}

      - name: Check if the Lambda function exists
        id: lambdaExists
        run: aws lambda get-function --function-name ${{ env.APPLICATION_NAME }}
        continue-on-error: true

      - name: Check if the role exists
        id: roleExists
        if: steps.lambdaExists.outcome == 'failure'
        run: aws iam get-role --role-name lambda-${{ env.APPLICATION_NAME }}
        continue-on-error: true

      - name: Create a new role if it does not exist
        if: steps.lambdaExists.outcome == 'failure' && steps.roleExists.outcome == 'failure'
        run: >
          aws iam create-role --role-name lambda-${{ env.APPLICATION_NAME }} --assume-role-policy-document '{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }]}' && sleep 30s

      - name: Attach the basic execution role
        if: steps.lambdaExists.outcome == 'failure' && steps.roleExists.outcome == 'failure'
        run: aws iam attach-role-policy --role-name lambda-${{ env.APPLICATION_NAME }} --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

      - name: Create a Lambda function if the Lambda function does not exist
        if: steps.lambdaExists.outcome == 'failure'
        run: aws lambda create-function --function-name ${{ env.APPLICATION_NAME }} --code ImageUri=${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }} --package-type Image --role arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/lambda-${{ env.APPLICATION_NAME }}

      - name: Update the Lambda function if the Lambda function does exist
        if: steps.lambdaExists.outcome == 'success'
        run: aws lambda update-function-code --function-name ${{ env.APPLICATION_NAME }} --image-uri ${{ env.ECR_PREFFIX }}/${{ env.CONTAINER_NAME }}
```

## Push 한 번이면 끝
Github Actions를 모두 작성했다면 레포지토리의 Github Actions Secrets에

- AWS_ACCOUNT_ID
- AWS_ACEESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

네 가지 정보만 저장한 다음 main 혹은 dev 브랜치에 소스 코드를 Push해 보자. Push 한 번이면 레포지토리 이름으로 된 AWS Lambda가 자동으로 배포될 것이다.