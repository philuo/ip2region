# @yuo/ip2region

> IP -> 行政区映射

## 内存数据库

- 3.9MB
- 99.9% accuracy > sohu > alibaba
- 支持高并发：50000~80000qps

## 继续完善

[每隔一段时间, 会有更新](http://ips.chacuo.net/view/s_HI)

- 1. 把数据按照下边的格式补充到 src/ip.txt 中

```
// ip.txt
223.255.253.0|223.255.253.255|贵州|贵阳|电信
```

- 2. 执行编译

```
npm run build
```

- 3. data/ip2region
## 使用方法

```ts
npm i @yuo/ip2region
```

```ts
import IpReader from '@yuo/ip2region';

// { cid: 1, province: '北京', city: '北京', ips: '阿里云' }
console.log(IpReader('39.107.84.26'));
```
